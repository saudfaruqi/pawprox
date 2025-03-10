import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className=" bg-gray-800 text-white p-4 relative z-30 mt-[100px]">
      <ul className="flex justify-center space-x-8 w-full h-[30px]">
        <li className="mb-4">
          <Link to={"/community"}>
            <a className="hover:text-blue-400">Posts</a>
          </Link>
        </li>
        <li className="mb-4">
          <Link to={"/messages"}>
            <a className="hover:text-blue-400">Messages</a>
          </Link>
        </li>
        <li className="mb-4">
          <Link to={"/settings"}>
            <a className="hover:text-blue-400">Settings</a>
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar