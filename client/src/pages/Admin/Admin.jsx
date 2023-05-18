import React, { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import CourseListViewer from "../../components/CourseListViewer/CourseListViewer"
import { requiresLogin } from "../../services/authentication.service"
import './Admin.css'


export default function Admin() {
    const navigate = useNavigate()

    // selector options
    const [years] = useState(() => {
        const time = new Date()
        const year = time.getFullYear()
        let years = []
        for(let i = 0; i < 3; i++) {
            years.push(year - i)
        }
        return years
    })
    const [terms] = useState([
        { value: 'fall', text: 'Fall' },
        { value: 'spring', text: 'Spring' },
        { value: 'summer', text: 'Summer' }
    ])

    // pass to listviewer component
    const [targetYear, setTargetYear] = useState(years[0])
    const [targetTerm, setTargetTerm] = useState(terms[0].value)

    useEffect(() => {
        async function init() {
            // check login status
            if(await requiresLogin('admin')) {
                navigate('/admin/login', { replace: true })
            }
        }
        init()
    }, [])


    function handleYearChange(event) {
        setTargetYear(event.target.value)
    }
    function handleTermChange(event) {
        setTargetTerm(event.target.value)
    }

    async function handleLogout() {
        const response = await fetch('/api/admin/logout', { method: 'POST' })
        if(response.status !== 200) {
            return alert('Something went wrong... Please try again')
        }

        navigate('/admin/login')
    }

    return (
        <div className="admin-dashboard">
            <h1>Manage courses</h1>
            <div className="flex">
                <div>
                    <select name="academicTerm" id="selectAcademicTerm" onChange={handleTermChange}>
                        {terms.map((option, index) => (
                            <option key={index} value={option.value}>{option.text}</option>
                        ))}
                    </select>
                    <select name="academicYear" id="selectAcademicYear" onChange={handleYearChange}>
                        {years.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button type="button" className="btn btn-outline-dark" onClick={() => navigate('/admin/database-manager')}>View database</button>
                    <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>Log out</button>
                </div>
            </div>

            <section className="workarea">
                <CourseListViewer year={targetYear} term={targetTerm}/>
            </section>
        </div>
    )
}