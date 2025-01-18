import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'
import '../home.css'

const Home = () => {

    const { user } = useContext(UserContext)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ projectName, setProjectName ] = useState(null)
    const [ project, setProject ] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        console.log({ projectName })

        axios.post('/projects/create', {
            name: projectName
        })
            .then((res) => {
                console.log(res)
                setIsModalOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all').then((res) => {
            setProject(res.data.projects)

        }).catch(err => {
            console.log(err)
        })

    }, [])

    return (
        <main className='p-4 bg-gradient-animation'>
            <section className="text-center mb-10 p-2">
                <h1 className="text-8xl font-bold text-white flex flex-col">
                    <span className="animate-slide-in">Think</span> {' '}
                    <span className="animate-slide-in delay-500">Create</span> {' '}
                    <span className="animate-slide-in delay-1000">Collaborate</span>
                </h1>
            </section>
            <section className="flex flex-wrap gap-20 p-2 justify-center">
                <div className="card bg-opacity-50 bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-1500  w-96">
                    <h2 className="card-heading text-3xl font-semibold absolute">Project Management</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center md:mt-20">
                        <img
                            src="https://imgs.search.brave.com/AC_KK4zHxFXCgqUb8b2IsbLmqa7UlX2vAecLqLTEEUQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0Lzc5LzIzLzEy/LzM2MF9GXzQ3OTIz/MTI5MV9GSTk2YjJl/RHlpZGd0eHVsbzA4/S0dEMHdrczFaREV6/cS5qcGc"
                            alt="Project Management"
                            className="w-48 h-48 object-cover rounded-md mb-4 md:mb-0 md:mr-4 animate-fade-in-up delay-500"
                        />
                        <p className="text-center text-xl md:text-left font-serif animate-fade-in-up delay-700">
                            Organize and manage your projects efficiently. 
                            Get all the projects at one place. Create or Monitor at ease.
                        </p>
                    </div>
                </div>
                <div className="card bg-opacity-50 bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-2000  w-96">
                    <h2 className="card-heading text-3xl font-semibold absolute">Team Collaboration</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center mt-12 md:mt-20">
                        <img
                            src="https://imgs.search.brave.com/H46IftU0sXMO6Vl58ZnZwglaPf_vtLEzHyuU1RTbHLY/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzZjLzI0/L2Y0LzZjMjRmNGM3/YTE4MWQ4NTY4NTRh/MDVkYTFmZGRlZmQw/LmpwZw"
                            alt="Team Collaboration"
                            className="w-48 h-48 object-cover rounded-md mb-4 md:mb-0 md:mr-4 animate-fade-in-up delay-500"
                        />
                        <p className="text-center text-xl md:text-left font-serif animate-fade-in-up delay-700">
                            Work together seamlessly with your team. 
                            Share your ideas, contribute to progress, delegate the work, innovate together and learn from each other.
                        </p>
                    </div>
                </div>
                <div className="card bg-opacity-50 bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-2500 w-96">
                    <h2 className="card-heading text-3xl font-semibold absolute">AI</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center mt-12 md:mt-20 text-wrap">
                        <img
                            src="https://imgs.search.brave.com/ewhZpUJPupTGBRqM99n-ZDB3YuxeideFeyT2y8ji1dQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9haS5n/b29nbGUuZGV2L3N0/YXRpYy9pbWFnZXMv/bGFuZGluZy9nZW1p/bmktc3RhcnQtYnVp/bGRpbmctY2FyZC1u/YW5vLnN2Zw" 
                            alt="AI"
                            className="w-40 h-40 object-cover rounded-md mb-4 md:mb-0 md:mr-4 animate-fade-in-up delay-500"
                        />
                        <p className="text-center  text-xl md:text-left font-serif animate-fade-in-up delay-700">
                            The power of AI at your leisure. Use AI to get insights, help with code snippets and many more. Even getting started with your new project from scratch is just a command away.
                        </p>
                    </div>
                </div>
            </section>
            <div className="projects flex flex-wrap gap-3 mt-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="project p-4 border border-slate-300 rounded-md bg-gray-800 opacity-70 text-white font-bold  hover:bg-slate-400">
                    New Project
                    <i className="ri-link ml-2"></i>
                </button>

                {
                    project.map((project) => (
                        <div key={project._id}
                            onClick={() => {
                                navigate(`/project`, {
                                    state: { project }
                                })
                            }}
                            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 bg-gray-800 opacity-70 text-white font-bold hover:bg-slate-400">
                            <h2
                                className='font-semibold'
                            >{project.name}</h2>

                            <div className="flex gap-2">
                                <p> <small> <i className="ri-user-line"></i> Collaborators</small> :</p>
                                {project.users.length}
                            </div>

                        </div>
                    ))
                }


            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-1/3">
                        <h2 className="text-xl mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text" className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" className="mr-2 px-4 py-2 bg-gray-300 rounded-md" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </main>
    )
}

export default Home