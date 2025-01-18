import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webContainer'

function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}

const Project = () => {
    const location = useLocation()
    const [ isSidePanelOpen, setIsSidePanelOpen ] = useState(false)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedUserId, setSelectedUserId ] = useState(new Set())
    const [ project, setProject ] = useState(location.state.project)
    const [ message, setMessage ] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()

    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([])
    const [ fileTree, setFileTree ] = useState({})

    const [ currentFile, setCurrentFile ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])

    const [ webContainer, setWebContainer ] = useState(null)
    const [ iframeUrl, setIframeUrl ] = useState(null)
    const [ runProcess, setRunProcess ] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }
            return newSelectedUserId;
        });
    }

    // 1) Fetch the updated project data after adding collaborators
    function addCollaborators() {
        axios.put("/projects/add_users", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(async (res) => {
            console.log(res.data)
            // Fetch the updated project so the side panel shows newly added collaborators
            const updated = await axios.get(`/projects/get-project/${location.state.project._id}`)
            setProject(updated.data.project)
            setIsModalOpen(false)
        }).catch(err => {
            console.log(err)
        })
    }

    const send = () => {
        // Emit the message without updating local messages here
        // so the receiver does not see duplicates.
        const socketData = {
            message,
            sender: user
        };
        initializeSocket(project._id).emit('project-message', socketData)
        setMessage("")
    }

    function WriteAiMessage(message) {

        let text = message
        try {
            const msgObj = JSON.parse(message)
            if (Array.isArray(msgObj.functions)) {
                text = msgObj.functions
                    .map(func => `
    ### Function: ${func.functionName}
    **Description:**  
    ${func.description}
    
    \`\`\`java
    ${func.code}
    \`\`\`
    
    **Example Usage:**  
    \`\`\`java
    ${func.exampleUsage}
    \`\`\`
    `).join('\n\n');
            } else if (msgObj.text) {
                text = msgObj.text;
            }
        } catch (err) {
            // If not valid JSON, leave text as raw message
        }
    


        //     if (msgObj.text) {
        //         text = msgObj.text
        //     }
        // } catch (err) {
        //     // If not valid JSON, leave text as raw message
        // }
        return (
            <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2 max-h-96'>
                <Markdown
                    children={text}
                    options={{
                        overrides: {
                            code: SyntaxHighlightedCode,
                        },
                    }}
                />
            </div>
        )

        // const messageObject = JSON.parse(message)
        // return (
        //     <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
        //         <Markdown
        //             children={messageObject.text}
        //             options={{
        //                 overrides: {
        //                     code: SyntaxHighlightedCode,
        //                 },
        //             }}
        //         />
        //     </div>
        // )
    }

    useEffect(() => {
        // Initialize or retrieve the socket
        const socket = initializeSocket(project._id)

        // Define the incoming message handler just once
        const handleProjectMessage = (data) => {
            console.log(data)
            if (data.sender._id === 'ai') {
                const parsedMsg = JSON.parse(data.message)
                console.log(parsedMsg)
                webContainer?.mount(parsedMsg.fileTree)

                if (parsedMsg.fileTree) {
                    setFileTree(parsedMsg.fileTree || {})
                }
                setMessages(prevMessages => [ ...prevMessages, data ])
            } else {
                setMessages(prevMessages => [ ...prevMessages, data ])
            }
        }

        // Attach the event listener
        socket.on('project-message', handleProjectMessage)

        // Prepare the web container if not set
        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        // Fetch current project data
        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            console.log(res.data.project)
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        // Fetch all users
        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            console.log(err)
        })

        // Cleanup: remove the handler to avoid duplicates
        return () => {
            socket.off('project-message', handleProjectMessage)
        }
    }, [])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

    return (
        <main className='h-screen w-screen flex'>
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
                <header className='bg-gradient-to-tr from-blue-500 to-blue-100 shadow-lg flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button className='flex gap-2 rounded-lg border-2 bg-gradient-to-tr from-blue-500 to-blue-100 shadow-xl ' onClick={() => setIsModalOpen(true)}>
                        {/* <i className="ri-add-fill"></i> */}
                        <p className='p-2 font-semibold text-gray-900'>Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-1 border-2 border-black rounded-xl'>
                    &#9820;
                    </button>
                </header>
                <div className="conversation-area bg-gradient-to-tr from-blue-400 to-blue-100 pt-14 pb-10 flex-grow flex flex-col h-full relative">
                    <div
                        ref={messageBox}
                        className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id === user._id.toString() && 'ml-auto'} message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                <div className='text-sm'>
                                    {msg.sender._id === 'ai'
                                        ? WriteAiMessage(msg.message)
                                        : <p>{msg.message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="inputField w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-2 px-4 border-none outline-none flex-grow'
                            type="text"
                            placeholder='Enter message'
                        />
                        <button
                            onClick={send}
                            className='px-5 bg-slate-100 font-extrabold'>
                            &#11162;
                        </button>
                    </div>
                </div>
                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
                        <h1 className='font-semibold text-lg'>Collaborators</h1>
                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">
                        {project.users && project.users.map(user => (
                            <div
                                key={user._id}
                                className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                    <i className="ri-user-fill absolute"></i>
                                </div>
                                <h1 className='font-semibold text-lg'>{user.email}</h1>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="right bg-red-50 flex-grow h-full flex">
                <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
                    <div className="file-tree w-full">
                        {Object.keys(fileTree).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file)
                                    setOpenFiles(prev => [...new Set([...prev, file])])
                                }}
                                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full">
                                <p className='font-semibold text-lg'>{file}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="code-editor flex flex-col flex-grow h-full shrink">
                    <div className="top flex justify-between w-full">
                        <div className="files flex">
                            {openFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFile(file)}
                                    className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${currentFile === file ? 'bg-slate-400' : ''}`}>
                                    <p className='font-semibold text-lg'>{file}</p>
                                </button>
                            ))}
                        </div>
                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {
                                    await webContainer.mount(fileTree)
                                    const installProcess = await webContainer.spawn("npm", [ "install" ])
                                    installProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))
                                    if (runProcess) {
                                        runProcess.kill()
                                    }
                                    let tempRunProcess = await webContainer.spawn("npm", [ "start" ])
                                    tempRunProcess.output.pipeTo(new WritableStream({
                                        write(chunk) {
                                            console.log(chunk)
                                        }
                                    }))
                                    setRunProcess(tempRunProcess)
                                    webContainer.on('server-ready', (port, url) => {
                                        console.log(port, url)
                                        setIframeUrl(url)
                                    })
                                }}
                                className='p-2 px-4 bg-slate-300 text-white'
                            >
                                run
                            </button>
                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {fileTree[currentFile] && (
                            <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                <pre className="hljs h-full">
                                    <code
                                        className="hljs h-full outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const updatedContent = e.target.innerText
                                            const ft = {
                                                ...fileTree,
                                                [currentFile]: {
                                                    file: {
                                                        contents: updatedContent
                                                    }
                                                }
                                            }
                                            setFileTree(ft)
                                            saveFileTree(ft)
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value
                                        }}
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            paddingBottom: '25rem',
                                            counterSet: 'line-numbering'
                                        }}
                                    />
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
                {iframeUrl && webContainer && (
                    <div className="flex min-w-96 flex-col h-full">
                        <div className="address-bar">
                            <input
                                type="text"
                                onChange={(e) => setIframeUrl(e.target.value)}
                                value={iframeUrl}
                                className="w-full p-2 px-4 bg-slate-200"
                            />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full"></iframe>
                    </div>
                )}
            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold text-blue-700'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users.map(user => (
                                // 2) Use user._id as the key to ensure proper reactivity
                                <div
                                    key={user._id}
                                    className={`user cursor-pointer hover:bg-slate-200 ${
                                        Array.from(selectedUserId).indexOf(user._id) !== -1 ? 'bg-slate-200' : ''
                                    } p-2 flex gap-2 items-center`}
                                    onClick={() => handleUserClick(user._id)}
                                >
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'
                        >
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project