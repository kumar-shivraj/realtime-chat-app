import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext)
  const [selectedImg, setSelectedImg] = useState(null)
  const [name, setName] = useState(authUser?.fullName || 'QuickChat User')
  const [bio, setBio] = useState(authUser?.bio || 'Hi Everyone, I am Using QuickChat')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedImg) {
      await updateProfile({
        fullName: name,
        bio
      })
      navigate('/')
      return
    }

    // eslint-disable-next-line
    const reader = new FileReader()
    reader.readAsDataURL(selectedImg)
    reader.onload = async () => {
      const base64Image = reader.result
      await updateProfile({
        fullName: name,
        bio,
        profilePic: base64Image
      })
      navigate('/')
    }
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form
          className='flex flex-col gap-5 p-10 flex-1'
          onSubmit={handleSubmit}
        >
          <h3 className='text-lg'>Profile details</h3>
          <label
            htmlFor='avatar'
            className='flex items-center gap-3 cursor-pointer'
          >
            <input
              type='file'
              id='avatar'
              accept='.png, .jpg, .jpeg'
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatarIcon}
              alt=''
              className={`w-12 h-12 ${selectedImg && 'rounded-full'}`}
            />
            upload profile image
          </label>
          <input
            type='text'
            required
            placeholder='Your name'
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            onChange={(e) => setName(e.target.value)}
            value={name}
          />

          <textarea
            placeholder='Write proile bio'
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            value={bio}
          />
          <button
            type='submit'
            className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer'
          >Save
          </button>
        </form>

        <img
          src={authUser?.profilePic || assets.logoIcon}
          alt=''
          className={`max-2-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && 'rounded-full'}`}
        />
      </div>
    </div>
  )
}

export default ProfilePage
