from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel
import pytest

from app.main import app # Main FastAPI application
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project # Import Project
from app.models.requirements import Requirement
from app.schemas.requirements import RequirementCreate, RequirementRead # RequirementUpdate not used in this simplified version of tests directly
from app.db.session import engine # Use the same engine for consistency in this basic setup

# Test database setup
@pytest.fixture(scope="session", autouse=True)
def create_test_database_tables():
    # Ensures all tables defined in SQLModel are created.
    # init_db() from session.py should do this by importing all model files.
    # For tests, explicitly calling create_all here is also fine.
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="module")
def client():
    # Define the dependency override here before TestClient is instantiated
    def override_get_current_user_for_tests():
        # This user must exist in the DB for some tests, or be transient if not DB dependent.
        # Let's ensure this user is created by a fixture.
        # For simplicity, we return a transient User object.
        # This user would need an ID if used in FK relationships from created objects.
        # A more robust approach involves creating this user in the DB via a fixture.
        # For now, a simple mock:
        return User(id=1, username="testuser", email="testuser@example.com", is_active=True, is_superuser=False)

    app.dependency_overrides[get_current_user] = override_get_current_user_for_tests
    return TestClient(app)

@pytest.fixture(scope="function") # Changed to function scope for cleaner test user handling
def test_user(db_session: Session):
    user = db_session.exec(User.select().where(User.email == "testuser@example.com")).first()
    if not user:
        # Ensure the ID is 1 to match the override_get_current_user_for_tests if it returns a user with ID 1
        # This is a simplification; ideally, the override would fetch the user from this fixture,
        # or the fixture would create a user with a dynamic ID and the override would use that.
        user = User(id=1, username="testuser", email="testuser@example.com", hashed_password="fakehashedpassword", is_active=True, is_superuser=False)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    elif user.id != 1 : # If user exists but ID is not 1, this is problematic for consistency with override
        # This scenario indicates a need for better test data management or a more dynamic override.
        # For this example, we'll proceed, but it's a point of fragility.
        # One option: delete and recreate, or update ID if possible (not typically recommended for PKs).
        # Simplest for now: assume this test_user fixture is the source of truth for the user with ID=1.
        # If the override always returns user ID 1, this fixture must ensure user ID 1 is this "testuser".
        pass # User exists, and we assume it's the one we need (ID=1) or tests will be inconsistent.

    return user


@pytest.fixture(scope="function")
def test_project(db_session: Session, test_user: User):
    # Attempt to get project if it exists, otherwise create it.
    # Using a fixed ID (1) for the project to simplify tests.
    project = db_session.get(Project, 1)
    if not project:
        project = Project(id=1, name="Test Project", description="A project for testing", owner_id=test_user.id)
        db_session.add(project)
        db_session.commit()
        db_session.refresh(project)
    elif project.owner_id != test_user.id:
        # If project 1 exists but has a different owner, this could be an issue.
        # For robust tests, clear project table or use dynamic IDs.
        # For now, assume this is fine or tests will fail indicating data inconsistency.
        pass
    return project


def test_create_requirement(client: TestClient, db_session: Session, test_project: Project): # test_user implicitly used by override
    requirement_data_live = {
        "title": "Test Req Create",
        "description": "Desc for create",
        "project_id": test_project.id, # Use the ID from the created test_project
        "is_active": True
    }
    response = client.post("/api/v1/requirements/", json=requirement_data_live)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == requirement_data_live["title"]
    assert data["project_id"] == test_project.id
    assert "id" in data

    req_id = data["id"]
    db_req = db_session.get(Requirement, req_id)
    assert db_req is not None
    assert db_req.title == requirement_data_live["title"]


def test_read_requirement(client: TestClient, db_session: Session, test_project: Project):
    req_data = {"title": "Test Req Read", "project_id": test_project.id, "description": "Test Description"}
    # SQLModel uses .from_orm for Pydantic v1 style, .model_validate for Pydantic v2
    # Assuming SQLModel is Pydantic v1 compatible here based on Requirement.from_orm in API code
    req = Requirement(**req_data) # More direct if all fields are present and match model
    db_session.add(req)
    db_session.commit()
    db_session.refresh(req)

    response = client.get(f"/api/v1/requirements/{req.id}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == req.title
    assert data["id"] == req.id


def test_read_requirements_list(client: TestClient, db_session: Session, test_project: Project): # Renamed to avoid conflict
    req1_data = {"title": "Test Req List 1", "project_id": test_project.id, "description": "Desc 1"}
    req1 = Requirement(**req1_data)
    req2_data = {"title": "Test Req List 2", "project_id": test_project.id, "description": "Desc 2"}
    req2 = Requirement(**req2_data)
    db_session.add_all([req1, req2])
    db_session.commit()

    response = client.get("/api/v1/requirements/")
    assert response.status_code == 200, response.text
    data = response.json()
    # This check is fragile if DB is not perfectly clean or other tests add items.
    # A better check filters by project_id or checks for specific items.

    # Filter results for the current test project to make assertion more robust
    project_specific_reqs = [r for r in data if r["project_id"] == test_project.id]
    assert len(project_specific_reqs) >= 2

    titles = [item["title"] for item in project_specific_reqs]
    assert req1.title in titles
    assert req2.title in titles


def test_update_requirement(client: TestClient, db_session: Session, test_project: Project):
    req_data = {"title": "Test Req Update", "project_id": test_project.id, "description": "Initial desc"}
    req = Requirement(**req_data)
    db_session.add(req)
    db_session.commit()
    db_session.refresh(req)

    update_payload = {"title": "Updated Test Req"}
    response = client.put(f"/api/v1/requirements/{req.id}", json=update_payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == update_payload["title"]

    db_session.refresh(req) # Refresh req from DB
    assert req.title == update_payload["title"]


def test_delete_requirement(client: TestClient, db_session: Session, test_project: Project):
    req_data = {"title": "Test Req Delete", "project_id": test_project.id, "description": "To be deleted"}
    req = Requirement(**req_data)
    db_session.add(req)
    db_session.commit()
    db_session.refresh(req)

    response = client.delete(f"/api/v1/requirements/{req.id}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["ok"] is True

    db_req = db_session.get(Requirement, req.id)
    assert db_req is None
