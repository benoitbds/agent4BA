describe('spec CRUD', () => {
  let nodes: any[]
  let nextId: number

  const setupIntercepts = () => {
    cy.intercept('GET', '/api/v1/projects/1/requirements/', () => nodes).as('fetch')

    cy.intercept('POST', /\/api\/v1\/projects\/1\/requirements\/?$/, req => {
      const body = req.body
      const node = { id: nextId++, project_id: 1, level: 'requirement', ...body }
      nodes.push(node)
      req.reply(node)
    }).as('createRequirement')

    cy.intercept('POST', /\/api\/v1\/projects\/1\/requirements\/(\d+)\/epics\/?$/, req => {
      const reqId = Number(req.url.match(/requirements\/(\d+)/)![1])
      const body = req.body
      const node = {
        id: nextId++,
        project_id: 1,
        level: 'epic',
        parent_req_id: reqId,
        ...body,
      }
      nodes.push(node)
      req.reply(node)
    }).as('createEpic')

    cy.intercept('POST', /\/api\/v1\/projects\/1\/requirements\/(\d+)\/epics\/(\d+)\/features\/?$/, req => {
      const m = req.url.match(/requirements\/(\d+)\/epics\/(\d+)/)!
      const body = req.body
      const node = {
        id: nextId++,
        project_id: 1,
        level: 'feature',
        parent_req_id: Number(m[1]),
        parent_epic_id: Number(m[2]),
        ...body,
      }
      nodes.push(node)
      req.reply(node)
    }).as('createFeature')

    cy.intercept('POST', /\/api\/v1\/projects\/1\/epics\/(\d+)\/features\/(\d+)\/stories\/?$/, req => {
      const m = req.url.match(/epics\/(\d+)\/features\/(\d+)/)!
      const body = req.body
      const node = {
        id: nextId++,
        project_id: 1,
        level: 'story',
        parent_epic_id: Number(m[1]),
        parent_feature_id: Number(m[2]),
        ...body,
      }
      nodes.push(node)
      req.reply(node)
    }).as('createStory')

    cy.intercept('POST', /\/api\/v1\/projects\/1\/features\/(\d+)\/stories\/(\d+)\/usecases\/?$/, req => {
      const m = req.url.match(/features\/(\d+)\/stories\/(\d+)/)!
      const body = req.body
      const node = {
        id: nextId++,
        project_id: 1,
        level: 'usecase',
        parent_feature_id: Number(m[1]),
        parent_story_id: Number(m[2]),
        ...body,
      }
      nodes.push(node)
      req.reply(node)
    }).as('createUsecase')

    cy.intercept('PUT', /\/api\/v1\/projects\/1\/.+\/(\d+)$/, req => {
      const id = Number(req.url.match(/(\d+)$/)![1])
      const idx = nodes.findIndex(n => n.id === id)
      if (idx >= 0) {
        nodes[idx] = { ...nodes[idx], ...req.body }
        req.reply(nodes[idx])
      } else {
        req.reply(404)
      }
    }).as('updateNode')

    cy.intercept('DELETE', /\/api\/v1\/projects\/1\/.+\/(\d+)$/, req => {
      const id = Number(req.url.match(/(\d+)$/)![1])
      nodes = nodes.filter(n => n.id !== id && n.parent_req_id !== id && n.parent_epic_id !== id && n.parent_feature_id !== id && n.parent_story_id !== id)
      req.reply({})
    }).as('deleteNode')
  }

  beforeEach(() => {
    nodes = [{ id: 1, title: 'Req1', level: 'requirement', project_id: 1 }]
    nextId = 2
    setupIntercepts()
  })

  it('creates, updates and deletes nodes with reload', () => {
    cy.visit('/projects/1')
    cy.contains('Éditer').click()

    // create hierarchy
    cy.contains('＋ Requirement').click()
    cy.get('input').first().type('Req2')
    cy.get('textarea').type('Desc')
    cy.contains('Enregistrer').click()
    cy.contains('Req2')

    cy.contains('Req2').parent().find('button').contains('＋').click()
    cy.get('input').first().type('Epic1')
    cy.contains('Enregistrer').click()
    cy.contains('Epic1')

    cy.contains('Epic1').parent().find('button').contains('＋').click()
    cy.get('input').first().type('Feature1')
    cy.contains('Enregistrer').click()
    cy.contains('Feature1')

    cy.contains('Feature1').parent().find('button').contains('＋').click()
    cy.get('input').first().type('Story1')
    cy.contains('Enregistrer').click()
    cy.contains('Story1')

    cy.contains('Story1').parent().find('button').contains('＋').click()
    cy.get('input').first().type('Usecase1')
    cy.contains('Enregistrer').click()
    cy.contains('Usecase1')

    cy.reload()
    cy.contains('Usecase1')

    // update titles
    const rename = (oldText: string, newText: string) => {
      cy.contains(oldText).dblclick()
      cy.focused().clear().type(newText + '{enter}')
      cy.contains(newText)
    }

    rename('Req2', 'Req2-upd')
    rename('Epic1', 'Epic1-upd')
    rename('Feature1', 'Feature1-upd')
    rename('Story1', 'Story1-upd')
    rename('Usecase1', 'Usecase1-upd')

    cy.reload()
    cy.contains('Usecase1-upd')

    // delete nodes
    const remove = (text: string) => {
      cy.contains(text).parent().find('button').contains('✖').click()
      cy.contains('Confirmer').click()
    }

    remove('Usecase1-upd')
    remove('Story1-upd')
    remove('Feature1-upd')
    remove('Epic1-upd')
    remove('Req2-upd')

    cy.contains('Req2-upd').should('not.exist')

    cy.reload()
    cy.contains('Req2-upd').should('not.exist')
  })
})
