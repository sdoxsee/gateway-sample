// adapted from https://github.com/taniarascia/react-hooks

import './App.css';
import React, { useState, Fragment } from 'react'
import AddUserForm from './forms/AddUserForm'
import EditUserForm from './forms/EditUserForm'
import UserTable from './tables/UserTable'
import { User } from './User';
import { Container, Row, Col } from 'reactstrap'

const App = () => {
  // Data
  const usersData = [
    { id: 1, name: 'Tania', username: 'floppydiskette' },
    { id: 2, name: 'Craig', username: 'siliconeidolon' },
    { id: 3, name: 'Ben', username: 'benisphere' },
  ]

  const initialFormState: User = { id: 0, name: '', username: '' }

  // Setting state
  const [ users, setUsers ] = useState(usersData)
  const [ currentUser, setCurrentUser ] = useState(initialFormState)
  const [ editing, setEditing ] = useState(false)

  // CRUD operations
  const addUser = (user: User) => {
    user.id = users.length + 1
    setUsers([ ...users, user ])
  }

  const deleteUser = (id: number) => {
    setEditing(false)

    setUsers(users.filter(user => user.id !== id))
  }

  const updateUser = (id: number, updatedUser: User) => {
    setEditing(false)

    setUsers(users.map(user => (user.id === id ? updatedUser : user)))
  }

  const editRow = (user: User) => {
    setEditing(true)

    setCurrentUser({ id: user.id, name: user.name, username: user.username })
  }

  return (
    <Container>
      <h1>CRUD App with Hooks</h1>
      <Row>
        <Col lg="6">
          {editing ? (
            <Fragment>
              <h2>Edit user</h2>
              <EditUserForm
                editing={editing}
                setEditing={setEditing}
                currentUser={currentUser}
                updateUser={updateUser}
              />
            </Fragment>
          ) : (
            <Fragment>
              <h2>Add user</h2>
              <AddUserForm addUser={addUser} />
            </Fragment>
          )}
        </Col>
        <Col lg="6">
          <h2>View users</h2>
          <UserTable users={users} editRow={editRow} deleteUser={deleteUser} />
        </Col>
      </Row>
    </Container>
  )
}

export default App;
