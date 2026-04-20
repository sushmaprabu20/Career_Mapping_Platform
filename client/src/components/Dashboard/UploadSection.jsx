import React, { useState } from 'react';
import api from '../../utils/api';
import { Upload, Keyboard, FileText } from 'lucide-react';

const UploadSection = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
    const [targetCareer, setTargetCareer] = useState('');
    const [file, setFile] = useState(null);
    const [manualSkills, setManualSkills] = useState('');
    const [analysisMode, setAnalysisMode] = useState('resume'); // 'resume' or 'manual'

    const careers = [
        'Software Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Data Scientist',
        'DevOps Engineer',
        'Other'
    ];

    const [customCareer, setCustomCareer] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!targetCareer) return alert('Please select a target career');

        onUploadStart();
        try {
            const finalCareer = targetCareer === 'Other' ? customCareer : targetCareer;
            if (targetCareer === 'Other' && !customCareer.trim()) {
                onUploadError();
                return alert('Please enter your target career');
            }

            if (analysisMode === 'resume') {
                if (!file) {
                    onUploadError();
                    return alert('Please select a resume file');
                }
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('targetCareer', finalCareer);
                const { data } = await api.post('/resume/upload', formData);
                onUploadSuccess(data);
            } else {
                if (!manualSkills.trim()) {
                    onUploadError();
                    return alert('Please enter your skills');
                }
                const { data } = await api.post('/resume/analyze-manual', {
                    targetCareer: finalCareer,
                    manualSkills
                });
                onUploadSuccess(data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Analysis failed');
            onUploadError();
        }
    };

    return (
        <div className="upload-section card">
            <h2>Analyze Your Career Path</h2>
            <p>Choose your preferred analysis method and select your target role.</p>

            <div className="analysis-mode-toggle">
                <button
                    className={`toggle-btn ${analysisMode === 'resume' ? 'active' : ''}`}
                    onClick={() => setAnalysisMode('resume')}
                    type="button"
                >
                    <FileText size={18} />
                    <span>Upload Resume</span>
                </button>
                <button
                    className={`toggle-btn ${analysisMode === 'manual' ? 'active' : ''}`}
                    onClick={() => setAnalysisMode('manual')}
                    type="button"
                >
                    <Keyboard size={18} />
                    <span>Enter Skills</span>
                </button>
            </div>

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

                {targetCareer === 'Other' && (
                    <div className="input-group">
                        <label>Enter Your Target Career</label>
                        <input
                            type="text"
                            placeholder="e.g. Flutter Developer, Cloud Architect..."
                            value={customCareer}
                            onChange={(e) => setCustomCareer(e.target.value)}
                            required
                            className="custom-career-input"
                        />
                    </div>
                )}

                {analysisMode === 'resume' ? (
                    <div className="drag-drop-area" onClick={() => document.getElementById('resume-file').click()}>
                        <Upload size={36} color="var(--primary-orange)" />
                        <p>{file ? file.name : 'Click or Drag & Drop Resume (PDF/DOCX)'}</p>
                        <input
                            id="resume-file"
                            type="file"
                            hidden
                            onChange={(e) => setFile(e.target.files[0])}
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        />
                    </div>
                ) : (
                    <div className="manual-skills-entry">
                        <label>Your Skills</label>
                        <textarea
                            placeholder="Enter skills (e.g. Node.js, React, Python, Git...)"
                            value={manualSkills}
                            onChange={(e) => setManualSkills(e.target.value)}
                            rows={4}
                            className="manual-skills-input"
                        />
                    </div>
                )}

                <button type="submit" className="btn-primary full-width">
                    {analysisMode === 'resume' ? 'Analyze Resume' : 'Analyze Skills'}
                </button>
            </form>
        </div>
    );
};

export default UploadSection;
