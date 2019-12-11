// adapted from https://github.com/taniarascia/react-hooks

import './App.css';
import React, { useState, Fragment, useEffect } from 'react'
import AddUserForm from './forms/AddUserForm'
import EditUserForm from './forms/EditUserForm'
import UserTable from './tables/UserTable'
import { User } from './User';
import { Container, Row, Col, Jumbotron, Button, Form, Input } from 'reactstrap'
import { useCookies } from 'react-cookie';

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
  const [ isAuthenticated, setAuthenticated ] = useState(false)
  const [ authenticatedUser, setAuthenticatedUser ] = useState('')
  const [ cookies, setCookie ] = useCookies(['XSRF-TOKEN']);
  const [ isLoading, setLoading ] = useState(true)
  
  useEffect(() => {
    // Create an scoped async function in the hook
    async function anyNameFunction() {
      try {
        const response = await fetch('/current-user', {credentials: 'include'});
      
        const body = await response.text();
        setLoading(false)
        if (body === '') {
          setAuthenticated(false)
          setAuthenticatedUser('')
          // window.location.replace("http://localhost:3000/login");
        } else {
          setAuthenticated(true)
          // setAuthenticatedUser(JSON.parse(body))
          setAuthenticatedUser(body)
        }
      } catch(err) {
        // window.location.replace("http://localhost:3000/login/oauth2/code/login-client");
      }
    }
    // Execute the created function directly
    anyNameFunction();
  }, []);

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

  // const logout = () => {
  //   window.location.href = '//' + window.location.hostname + ':' + (process.env.REACT_APP_REAL_PORT ? process.env.REACT_APP_REAL_PORT : 8080) + '/logout';
	// 	// fetch('/logout', {method: 'POST', credentials: 'include',
	// 	// 	headers: {'X-CSRF-TOKEN': cookies['XSRF-TOKEN']}}).then(res => res.json())
	// 	// 	.then(response => {
	// 	// 	// window.location.href = response.logoutUrl + "?id_token_hint=" +
	// 	// 	// 	response.idToken + "&post_logout_redirect_uri=" + window.location.origin;
	// 	// 	});
  // }
  
  const login = () => {
    let port = (window.location.port ? ':' + window.location.port : '');
    if (port === ':3000') {
      port = ':8080';
    }
    window.location.href = '//' + window.location.hostname + port + '/private';
  }

  return (
    <Container>
      <Jumbotron>
        <h1>CRUD App with Hooks</h1>
        {isAuthenticated ?
        <Form action="/logout" method="POST">
          <Input type="hidden" name="_csrf" value={cookies['XSRF-TOKEN']}/>
          {authenticatedUser}, want to <Button color="link">Logout</Button>?
        </Form> :
        <Button onClick={login}>Login</Button>
        }
      </Jumbotron>
      {isAuthenticated &&
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
      }
    </Container>    
  )
}

export default App;
