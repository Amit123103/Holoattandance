import { useState } from 'react'
import { FaUpload, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import api from '../api/axiosConfig'

export default function CSVUpload({ onUploadComplete }) {
    const [showModal, setShowModal] = useState(false)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState([])
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState(null)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (selectedFile) => {
        if (!selectedFile.name.endsWith('.csv')) {
            alert('Please upload a CSV file')
            return
        }

        setFile(selectedFile)

        // Parse CSV for preview
        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target.result
            const lines = text.split('\\n').filter(line => line.trim())
            const headers = lines[0].split(',').map(h => h.trim())
            const rows = lines.slice(1, 6).map(line => {
                const values = line.split(',').map(v => v.trim())
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || ''
                    return obj
                }, {})
            })
            setPreview(rows)
        }
        reader.readAsText(selectedFile)
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await api.post(
                '/api/admin/students/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )

            setResult(response.data)
            if (response.data.success) {
                setTimeout(() => {
                    setShowModal(false)
                    setFile(null)
                    setPreview([])
                    setResult(null)
                    onUploadComplete()
                }, 2000)
            }
        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.detail || 'Upload failed'
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="btn-secondary"
            >
                <FaUpload className="inline mr-2" />
                Upload CSV
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
                    onClick={() => !uploading && setShowModal(false)}>
                    <div className="glass-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Upload Students CSV</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white/70 hover:text-white"
                                disabled={uploading}
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {!result && (
                            <>
                                {/* File Upload Area */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${dragActive
                                        ? 'border-cyan-400 bg-cyan-400/10'
                                        : 'border-white/30 hover:border-white/50'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <FaUpload className="mx-auto text-4xl text-white/50 mb-4" />
                                    <p className="text-lg mb-2">
                                        {file ? file.name : 'Drag and drop CSV file here'}
                                    </p>
                                    <p className="text-sm text-white/50 mb-4">or</p>
                                    <label className="btn-primary cursor-pointer">
                                        Choose File
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* CSV Format Info */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold mb-2">CSV Format:</h3>
                                    <code className="text-sm text-cyan-400">
                                        name,registration_number,email,department
                                    </code>
                                    <p className="text-sm text-white/70 mt-2">
                                        Note: Biometric data will need to be added later through registration
                                    </p>
                                </div>

                                {/* Preview */}
                                {preview.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-3">Preview (first 5 rows):</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-white/20">
                                                        {Object.keys(preview[0]).map(header => (
                                                            <th key={header} className="text-left py-2 px-3">
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {preview.map((row, idx) => (
                                                        <tr key={idx} className="border-b border-white/10">
                                                            {Object.values(row).map((val, i) => (
                                                                <td key={i} className="py-2 px-3">{val}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className="btn-primary w-full"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Students'}
                                </button>
                            </>
                        )}

                        {/* Result */}
                        {result && (
                            <div className={`p-6 rounded-lg ${result.success
                                ? 'bg-green-500/20 border border-green-500/50'
                                : 'bg-red-500/20 border border-red-500/50'
                                }`}>
                                <div className="flex items-center mb-4">
                                    {result.success ? (
                                        <FaCheckCircle className="text-green-400 text-3xl mr-3" />
                                    ) : (
                                        <FaExclamationTriangle className="text-red-400 text-3xl mr-3" />
                                    )}
                                    <h3 className="text-xl font-bold">
                                        {result.success ? 'Upload Successful!' : 'Upload Failed'}
                                    </h3>
                                </div>
                                <p className="mb-4">{result.message}</p>
                                {result.imported && (
                                    <p className="text-sm">
                                        Successfully imported <strong>{result.imported}</strong> students
                                    </p>
                                )}
                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold mb-2">Errors:</p>
                                        <ul className="list-disc list-inside text-sm">
                                            {result.errors.map((error, idx) => (
                                                <li key={idx}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
