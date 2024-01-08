const request = async (path: string, init?: RequestInit,) => {
    return await fetch(`http://localhost:8001${path}`, init)
}

export default request