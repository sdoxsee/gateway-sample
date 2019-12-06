import React, { useState, useEffect } from 'react'
import { User } from '../User'
import { Form, Label, Input, Button, FormGroup } from 'reactstrap'

interface Props {
  currentUser: User,
  updateUser: (id: number, user: User) => void,
  setEditing: (isEditing: boolean) => void,
  editing: boolean
}
interface Event {
  target: any
}

const EditUserForm = (props: Props) => {
  const [ user, setUser ] = useState(props.currentUser)

  useEffect(
    () => {
      setUser(props.currentUser)
    },
    [ props ]
  )
  // You can tell React to skip applying an effect if certain values haven’t changed between re-renders. [ props ]

  const handleInputChange = (event: Event) => {
    const { name, value } = event.target

    setUser({ ...user, [name]: value })
  }

  return (
    <Form
      onSubmit={event => {
        event.preventDefault()

        props.updateUser(user.id, user)
      }}
    >
      <FormGroup>
        <Label>Name</Label>
        <Input type="text" name="name" value={user.name} onChange={handleInputChange} />
        <Label>Username</Label>
        <Input type="text" name="username" value={user.username} onChange={handleInputChange} />
      </FormGroup>
      <Button color="primary">Update user</Button>{' '}
      <Button color="secondary" onClick={() => props.setEditing(false)} className="button muted-button">
        Cancel
      </Button>
    </Form>
  )
}

export default EditUserForm
