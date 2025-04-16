import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Resources.module.css";
import gradesData from "../../data/grades.json";
import coursesData from "../../data/courses.json";

const Resources = () => {
    const [token, setToken] = useState(null);
    const [grades, setGrades] = useState(null);
    const [courses, setCourses] = useState(null);
    const [gradesMessage, setGradesMessage] = useState("");
    const [coursesMessage, setCoursesMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Get token from localStorage
        const storedToken = localStorage.getItem("a3s_access_token");
        if (!storedToken) {
            alert("No authentication token found. Please login first.");
            navigate("/login");
            return;
        }
        setToken(storedToken);
    }, [navigate]);

    const fetchGrades = async (method) => {
        try {
            setGradesMessage(`Checking authorization for ${method}...`);
            if (method === "GET") {
                setGrades(null);
            }

            const endpoint =
                "https://localhost:3000/university/students/grades";

            const options = {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            };

            // Add body for POST requests
            if (method === "POST") {
                options.body = JSON.stringify({
                    course: "New Course",
                    grade: "A",
                    credits: 3,
                    semester: "Fall 2023",
                });
            }

            console.log(`Sending ${method} request to:`, endpoint);
            console.log("Request options:", JSON.stringify(options));

            const response = await fetch(endpoint, options);
            console.log("Response status:", response.status);

            // Handle different response types
            if (response.ok) {
                try {
                    const contentType = response.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const data = await response.json();
                        setGradesMessage(data.message || "Request successful");
                    } else {
                        const text = await response.text();
                        setGradesMessage(
                            "Request successful (non-JSON response)"
                        );
                        console.log("Response text:", text);
                    }

                    if (method === "GET") {
                        setGrades(gradesData); // Using mock data for display
                    }
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    setGradesMessage(
                        "Request successful but couldn't parse response"
                    );
                }
            } else {
                try {
                    const contentType = response.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const error = await response.json();
                        setGradesMessage(
                            `Access Denied: ${error.error || "Not authorized"}`
                        );
                    } else {
                        const text = await response.text();
                        setGradesMessage(
                            `Error: Server returned ${response.status}`
                        );
                        console.log("Error response text:", text);
                    }
                } catch (parseError) {
                    console.error("Error parsing error response:", parseError);
                    setGradesMessage(
                        `Error: Server returned ${response.status}`
                    );
                }
            }
        } catch (error) {
            console.error("Request error:", error);
            setGradesMessage(`Error: ${error.message}`);

            if (method === "GET") {
                setGrades(gradesData);
            }
        }
    };

    const fetchCourses = async (method) => {
        try {
            setCoursesMessage(`Checking authorization for ${method}...`);
            if (method === "GET") {
                setCourses(null);
            }

            const endpoint =
                "https://localhost:3000/university/students/courses";

            const options = {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
            };

            // Add body for POST requests
            if (method === "POST") {
                options.body = JSON.stringify({
                    title: "New Course",
                    instructor: "Dr. Smith",
                    schedule: "MWF 10:00-11:00",
                    credits: 3,
                });
            }

            console.log(`Sending ${method} request to:`, endpoint);
            console.log("Request options:", JSON.stringify(options));

            const response = await fetch(endpoint, options);
            console.log("Response status:", response.status);

            // Handle different response types
            if (response.ok) {
                try {
                    const contentType = response.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const data = await response.json();
                        setCoursesMessage(data.message || "Request successful");
                    } else {
                        const text = await response.text();
                        setCoursesMessage(
                            "Request successful (non-JSON response)"
                        );
                        console.log("Response text:", text);
                    }

                    if (method === "GET") {
                        setCourses(coursesData); // Using mock data for display
                    }
                } catch (parseError) {
                    console.error("Error parsing response:", parseError);
                    setCoursesMessage(
                        "Request successful but couldn't parse response"
                    );
                }
            } else {
                try {
                    const contentType = response.headers.get("content-type");
                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const error = await response.json();
                        setCoursesMessage(
                            `Access Denied: ${error.error || "Not authorized"}`
                        );
                    } else {
                        const text = await response.text();
                        setCoursesMessage(
                            `Error: Server returned ${response.status}`
                        );
                        console.log("Error response text:", text);
                    }
                } catch (parseError) {
                    console.error("Error parsing error response:", parseError);
                    setCoursesMessage(
                        `Error: Server returned ${response.status}`
                    );
                }
            }
        } catch (error) {
            console.error("Request error:", error);
            setCoursesMessage(`Error: ${error.message}`);

            if (method === "GET") {
                setCourses(coursesData);
            }
        }
    };

    return (
        <div className={styles.resourcesContainer}>
            <Navbar />
            <main className={styles.content}>
                <div className={styles.header}>
                    <h1>Resources</h1>
                    <p>Access your academic information</p>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Grades</h2>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.getButton}
                                onClick={() => fetchGrades("GET")}
                            >
                                GET Grades
                            </button>
                            <button
                                className={styles.getButton}
                                onClick={() => fetchGrades("POST")}
                            >
                                POST Grade
                            </button>
                        </div>
                    </div>

                    {gradesMessage && (
                        <div
                            className={`${styles.message} ${
                                gradesMessage.includes("Denied") ||
                                gradesMessage.includes("Error")
                                    ? styles.error
                                    : styles.success
                            }`}
                        >
                            <p>{gradesMessage}</p>
                        </div>
                    )}

                    {grades && (
                        <div className={styles.dataTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Grade</th>
                                        <th>Credits</th>
                                        <th>Semester</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {grades.map((grade, index) => (
                                        <tr key={index}>
                                            <td>{grade.course}</td>
                                            <td className={styles.grade}>
                                                {grade.grade}
                                            </td>
                                            <td>{grade.credits}</td>
                                            <td>{grade.semester}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Courses</h2>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.getButton}
                                onClick={() => fetchCourses("GET")}
                            >
                                GET Courses
                            </button>
                            <button
                                className={styles.getButton}
                                onClick={() => fetchCourses("POST")}
                            >
                                POST Course
                            </button>
                        </div>
                    </div>

                    {coursesMessage && (
                        <div
                            className={`${styles.message} ${
                                coursesMessage.includes("Denied") ||
                                coursesMessage.includes("Error")
                                    ? styles.error
                                    : styles.success
                            }`}
                        >
                            <p>{coursesMessage}</p>
                        </div>
                    )}

                    {courses && (
                        <div className={styles.dataTable}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course ID</th>
                                        <th>Title</th>
                                        <th>Instructor</th>
                                        <th>Schedule</th>
                                        <th>Credits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course) => (
                                        <tr key={course.id}>
                                            <td>{course.id}</td>
                                            <td>{course.title}</td>
                                            <td>{course.instructor}</td>
                                            <td>{course.schedule}</td>
                                            <td>{course.credits}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Resources;
