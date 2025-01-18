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
                <div className="card bg-opacity-50 bg-transparent bg-slate-700 text-white p-5 rounded-xl shadow-2xl transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-2500 w-96">
                  <h2 className="card-heading text-4xl font-bold mb-6 text-center relative">
                   Project Management
                  </h2>
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="image-container relative w-48 h-48">
                      <img
                        src="/images/360_F_184779880_XZzaToCBKjaZuQrrT5Hawx3mNsQt0n3N.jpg"
                        alt="AI"
                        className="w-full h-full object-cover rounded-full shadow-lg border-4 border-gray-700"
                      />
                    </div>
                    <p className="text-lg leading-relaxed font-serif px-4">
                    Organize and manage your projects efficiently. 
                    Get all the projects at one place. Create or Monitor at ease.
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="card bg-opacity-50 bg-transparent bg-slate-700 text-white p-6 rounded-xl shadow-2xl transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-2500 w-96">
                  <h2 className="card-heading text-4xl font-bold mb-6 text-center relative">
                   Team Collaboration
                  </h2>
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="image-container relative w-48 h-48">
                      <img
                        src="/images/teamcollab.jpg"
                        alt="AI"
                        className="w-full h-full object-cover rounded-full shadow-lg border-4 border-gray-700"
                      />
                    </div>
                    <p className="text-lg leading-relaxed font-serif px-4">
                     Work together seamlessly with your team. 
                     Share your ideas, contribute to progress, delegate the work, innovate together and learn from each other.
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="card bg-opacity-50 bg-transparent bg-slate-700 text-white p-6 rounded-xl shadow-2xl transform transition-transform duration-700 hover:scale-105 animate-slide-in delay-2500 w-96">
                  <h2 className="card-heading text-4xl font-bold mb-6 text-center relative">
                   AI
                  </h2>
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="image-container relative w-48 h-48">
                      <img
                        src="/images/Airobo.webp"
                        alt="AI"
                        className="w-full h-full object-cover rounded-full shadow-lg border-4 border-gray-700"
                      />
                    </div>
                    <p className="text-lg leading-relaxed font-serif px-4">
                    The power of AI at your leisure. Use AI to get insights, help with code snippets, and much more. Even getting started with your new project from scratch is just a command away.
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
                
            </section>
            <section>
                <h2 className='text-4xl font-semibold text-white p-5'>Your projects :</h2>
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