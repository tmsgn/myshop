import { Loader2 } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <div className='flex flex-col items-center space-y-2'>
        <Loader2 className='h-10 w-10  animate-spin' />
        <span className=' text-lg font-medium'>Loading...</span>
      </div>
    </div>
  )
}

export default Loading