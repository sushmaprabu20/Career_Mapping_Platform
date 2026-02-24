import React from 'react';
import './Loader.css';
import { Search } from 'lucide-react';

const Loader = ({ text = "Analyzing Resume..." }) => {
    return (
        <div className="loader-overlay">
            <div className="magnifier-container">
                <div className="magnifier">
                    <div className="glass">
                        <Search size={40} className="search-icon" />
                    </div>
                    <div className="handle"></div>
                </div>
                <p className="loader-text">{text}</p>
            </div>
        </div>
    );
};

export default Loader;
