import React from 'react'
import { User } from '../User'
import { Table, Button } from 'reactstrap'

interface Props {
  users: User[];
  editRow: (user: User) => void,
  deleteUser: (id: number) => void
}

const UserTable = (props: Props) => (
  <Table hover responsive>
    <thead>
      <tr>
        <th>Name</th>
        <th>Username</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {props.users.length > 0 ? (
        props.users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.username}</td>
            <td>
              <Button color="secondary"
                onClick={() => {
                  props.editRow(user)
                }}
              >
                Edit
              </Button>{' '}
              <Button color="danger"
                onClick={() => props.deleteUser(user.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3}>No users</td>
        </tr>
      )}
    </tbody>
  </Table>
)

export default UserTable
