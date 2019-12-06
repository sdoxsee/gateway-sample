import React, { useState } from 'react'
import { User } from '../User'
import { Form, Label, Input, Button, FormGroup } from 'reactstrap'

interface Props {
  addUser: (user: User) => void
}
interface Event {
  target: any;
}

const AddUserForm = (props: Props) => {
  const initialFormState: User = { id: 0, name: '', username: '' }
  const [ user, setUser ] = useState(initialFormState)

  const handleInputChange = (event: Event) => {
    const { name, value } = event.target

    setUser({ ...user, [name]: value })
  }

  return (
    <Form
      onSubmit={event => {
        event.preventDefault()
        if (!user.name || !user.username) return

        props.addUser(user)
        setUser(initialFormState)
      }}
    >
      <FormGroup>
        <Label>Name</Label>
        <Input type="text" name="name" value={user.name} onChange={handleInputChange} />
        <Label>Username</Label>
        <Input type="text" name="username" value={user.username} onChange={handleInputChange} />
      </FormGroup>
      <Button color="primary">Add new user</Button>
    </Form>
  )
}

export default AddUserForm
