import React, { useState } from 'react';
import api from '../../utils/api';
import { X, Download, Loader2, Clock, Target, Lightbulb, CheckSquare, BookOpen, Sparkles } from 'lucide-react';
import './RoadmapModal.css';

const RoadmapModal = ({ missingSkills, targetCareer, readinessScore, onClose }) => {
    const [duration, setDuration] = useState(3);
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('duration'); // 'duration' | 'result'

    const durationOptions = [
        { value: 1, label: '1 Month', desc: 'Intensive sprint' },
        { value: 3, label: '3 Months', desc: 'Focused learning' },
        { value: 6, label: '6 Months', desc: 'Balanced pace' },
        { value: 12, label: '12 Months', desc: 'In-depth mastery' },
    ];

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/roadmap/generate', {
                missingSkills,
                targetCareer,
                readinessScore,
                duration,
            });
            setRoadmap(data.roadmap);
            setStep('result');
        } catch (err) {
            console.error('Error generating roadmap:', err);
            setError('Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!roadmap) return;

        let md = `# ${roadmap.title}\n\n`;
        md += `**Duration:** ${roadmap.duration}  \n`;
        md += `**Recommended Weekly Hours:** ${roadmap.weeklyHours || 'N/A'} hours\n\n`;
        md += `## Overview\n${roadmap.overview}\n\n`;
        md += `---\n\n`;

        if (roadmap.phases) {
            roadmap.phases.forEach((phase) => {
                md += `## Phase ${phase.phase}: ${phase.title}\n`;
                md += `**Duration:** ${phase.duration}  \n`;
                md += `**Goal:** ${phase.goal}\n\n`;

                if (phase.skills?.length) {
                    md += `**Skills Covered:** ${phase.skills.join(', ')}\n\n`;
                }

                if (phase.tasks?.length) {
                    md += `### Tasks\n`;
                    phase.tasks.forEach((t, i) => {
                        md += `${i + 1}. **${t.task}**\n`;
                        if (t.resource) md += `   - Resource: ${t.resource}\n`;
                        if (t.estimatedHours) md += `   - Estimated: ${t.estimatedHours} hours\n`;
                    });
                    md += `\n`;
                }

                md += `**Milestone:** ${phase.milestone}\n\n---\n\n`;
            });
        }

        if (roadmap.tips?.length) {
            md += `## 💡 Pro Tips\n`;
            roadmap.tips.forEach((tip) => {
                md += `- ${tip}\n`;
            });
            md += `\n`;
        }

        if (roadmap.successMetrics?.length) {
            md += `## 🎯 Success Metrics\n`;
            roadmap.successMetrics.forEach((m) => {
                md += `- ${m}\n`;
            });
        }

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${targetCareer.replace(/\s+/g, '_')}_Roadmap.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="roadmap-overlay" onClick={onClose}>
            <div className="roadmap-modal" onClick={(e) => e.stopPropagation()}>
                <button className="roadmap-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {step === 'duration' && (
                    <div className="roadmap-duration-step">
                        <div className="roadmap-modal-header">
                            <div className="roadmap-icon-wrapper">
                                <Sparkles size={28} color="#ff5722" />
                            </div>
                            <h2>Generate Your Learning Roadmap</h2>
                            <p>
                                Choose how much time you can dedicate to bridging your skill gaps
                                for <strong>{targetCareer}</strong>.
                            </p>
                        </div>

                        <div className="roadmap-skills-preview">
                            <h4>Skills to cover:</h4>
                            <div className="roadmap-skill-tags">
                                {missingSkills.map((skill) => (
                                    <span key={skill} className="roadmap-skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>

                        <div className="duration-selector">
                            <h4>Select your timeline:</h4>
                            <div className="duration-options">
                                {durationOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`duration-option ${duration === opt.value ? 'active' : ''}`}
                                        onClick={() => setDuration(opt.value)}
                                    >
                                        <Clock size={18} />
                                        <span className="duration-label">{opt.label}</span>
                                        <span className="duration-desc">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p className="roadmap-error">{error}</p>}

                        <button
                            className="btn-generate-roadmap"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Generating with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Generate Roadmap
                                </>
                            )}
                        </button>
                    </div>
                )}

                {step === 'result' && roadmap && (
                    <div className="roadmap-result-step">
                        <div className="roadmap-result-header">
                            <div>
                                <h2>{roadmap.title}</h2>
                                <p className="roadmap-overview">{roadmap.overview}</p>
                            </div>
                            <div className="roadmap-result-meta">
                                <span><Clock size={14} /> {roadmap.duration}</span>
                                <span><Target size={14} /> {roadmap.weeklyHours || '~10'} hrs/week</span>
                            </div>
                        </div>

                        <div className="roadmap-phases">
                            {roadmap.phases?.map((phase) => (
                                <div key={phase.phase} className="roadmap-phase">
                                    <div className="phase-header">
                                        <div className="phase-number">Phase {phase.phase}</div>
                                        <div className="phase-info">
                                            <h3>{phase.title}</h3>
                                            <span className="phase-duration">{phase.duration}</span>
                                        </div>
                                    </div>
                                    <p className="phase-goal">
                                        <Target size={14} /> <strong>Goal:</strong> {phase.goal}
                                    </p>

                                    {phase.skills?.length > 0 && (
                                        <div className="phase-skills">
                                            {phase.skills.map((s) => (
                                                <span key={s} className="phase-skill-tag">{s}</span>
                                            ))}
                                        </div>
                                    )}

                                    {phase.tasks?.length > 0 && (
                                        <div className="phase-tasks">
                                            {phase.tasks.map((t, i) => (
                                                <div key={i} className="phase-task">
                                                    <BookOpen size={14} />
                                                    <div>
                                                        <strong>{t.task}</strong>
                                                        {t.resource && (
                                                            <span className="task-resource">{t.resource}</span>
                                                        )}
                                                        {t.estimatedHours && (
                                                            <span className="task-hours">~{t.estimatedHours}h</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="phase-milestone">
                                        <CheckSquare size={14} />
                                        <span><strong>Milestone:</strong> {phase.milestone}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {roadmap.tips?.length > 0 && (
                            <div className="roadmap-tips">
                                <h4><Lightbulb size={16} /> Pro Tips</h4>
                                <ul>
                                    {roadmap.tips.map((tip, i) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className="btn-download-roadmap" onClick={handleDownload}>
                            <Download size={18} />
                            Download Roadmap (.md)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapModal;
