/// <reference types="cypress" />

// Simple CRUD flow using API requests to seed and clean the database

describe('spec crud api flow', () => {
  const projectId = 1
  let reqId: number

  it('creates, updates and deletes a requirement', () => {
    cy.request('POST', `/api/v1/projects/${projectId}/requirements/`, {
      title: 'Req',
      level: 'requirement'
    }).then((res) => {
      reqId = res.body.id
      expect(res.status).to.eq(200)
      return cy.request('PUT', `/api/v1/projects/${projectId}/requirements/${reqId}`, {
        id: reqId,
        title: 'Req upd',
        level: 'requirement'
      })
    }).then((res) => {
      expect(res.status).to.eq(200)
      return cy.request('DELETE', `/api/v1/projects/${projectId}/requirements/${reqId}`)
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 204])
    })
  })
})
