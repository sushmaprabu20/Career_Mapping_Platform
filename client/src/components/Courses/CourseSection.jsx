import React from 'react';
import './Courses.css';

const CourseSection = () => {
    const mockCourses = [
        {
            title: "Complete Web Development Bootcamp",
            platform: "Udemy",
            link: "https://www.udemy.com",
            thumbnail: "https://img-c.udemycdn.com/course/480x270/1565838_e227_10.jpg"
        },
        {
            title: "React JS Crash Course for Beginners",
            platform: "YouTube",
            link: "https://www.youtube.com",
            thumbnail: "https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg"
        },
        {
            title: "Node.js & MongoDB Masterclass",
            platform: "Udemy",
            link: "https://www.udemy.com",
            thumbnail: "https://img-c.udemycdn.com/course/480x270/2034176_2c6d_2.jpg"
        }
    ];

    return (
        <div className="courses-section">
            <h2>Recommended Courses</h2>
            <div className="courses-grid">
                {mockCourses.map((course, idx) => (
                    <div key={idx} className="course-card card">
                        <img src={course.thumbnail} alt={course.title} />
                        <div className="course-info">
                            <span className={`platform-badge ${course.platform.toLowerCase()}`}>
                                {course.platform}
                            </span>
                            <h3>{course.title}</h3>
                            <a href={course.link} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                                Watch Now
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseSection;
