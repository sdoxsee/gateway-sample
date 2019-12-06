import React, { useState } from 'react'
import { User } from '../User'

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
    <form
      onSubmit={event => {
        event.preventDefault()
        if (!user.name || !user.username) return

        props.addUser(user)
        setUser(initialFormState)
      }}
    >
      <label>Name</label>
      <input type="text" name="name" value={user.name} onChange={handleInputChange} />
      <label>Username</label>
      <input type="text" name="username" value={user.username} onChange={handleInputChange} />
      <button>Add new user</button>
    </form>
  )
}

export default AddUserForm
