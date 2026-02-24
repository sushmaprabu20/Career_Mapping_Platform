import React, { useState } from 'react';
import api from '../../utils/api';
import { Upload, ChevronDown } from 'lucide-react';

const UploadSection = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
    const [targetCareer, setTargetCareer] = useState('');
    const [file, setFile] = useState(null);

    const careers = [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Data Scientist',
        'DevOps Engineer'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !targetCareer) return alert('Please select a file and target career');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('targetCareer', targetCareer);

        onUploadStart();
        try {
            const { data } = await api.post('/resume/upload', formData);
            onUploadSuccess(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed');
            onUploadError();
        }
    };

    return (
        <div className="upload-section card">
            <h2>Analyze Your Career Path</h2>
            <p>Upload your resume and select the role you're aiming for.</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Target Career</label>
                    <div className="select-wrapper">
                        <select value={targetCareer} onChange={(e) => setTargetCareer(e.target.value)} required>
                            <option value="">Select Target Role</option>
                            {careers.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="drag-drop-area" onClick={() => document.getElementById('resume-file').click()}>
                    <Upload size={40} />
                    <p>{file ? file.name : 'Click or Drag & Drop Resume (PDF/DOCX)'}</p>
                    <input
                        id="resume-file"
                        type="file"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

                    />
                </div>

                <button type="submit" className="btn-primary full-width">Analyze Skill Gap</button>
            </form>
        </div>
    );
};

export default UploadSection;
