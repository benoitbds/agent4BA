describe('project detail happy path', () => {
  it('loads specs explorer', () => {
    cy.visit('/projects/1')
    cy.contains('Retour')
  })
})
