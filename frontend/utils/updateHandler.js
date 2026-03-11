import axios from 'axios'

export const CURRENT_VERSION = "1.0.0";
export const REMOTE_VERSION_URL = "https://raw.githubusercontent.com/Fabian-Luna-Vicente/MathPlus/main/version.json";

export const checkForUpdates = async (setUpdateStatus, setRemoteVersion, setDownloadUrl) => {
    setUpdateStatus('checking')
    try {
        const response = await axios.get(REMOTE_VERSION_URL)
        const data = response.data

        if (data.version !== CURRENT_VERSION) {
            setRemoteVersion(data.version)
            setDownloadUrl(data.url)
            setUpdateStatus('available')
        } else {
            setUpdateStatus('lastest')
        }
    } catch (error) {
        alert('Error buscando actualizaciones')
        console.error('Error buscando actualizaciones', error)
        setUpdateStatus('error')
    }

}