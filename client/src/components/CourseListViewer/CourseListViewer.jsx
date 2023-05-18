import React, { useEffect, useState } from "react"
import './CourseListViewer.css'


export default function CourseListViewer({year, term}) {

    const [dep, setDep] = useState('') // department (cmpt)
    const [num, setNum] = useState('') // course number (372)
    const [list, setList] = useState([])
    const [heading, setHeading] = useState('Departments')
    const [loading, setLoadingStatus] = useState(false)

    const viewLevel = { deps: 0, courses: 1, sections: 2 }


    useEffect(() => {
        if(dep !== '') {
            if(num !== '') {
                setHeading('Sections')
                getData(viewLevel.sections)
            }else {
                setHeading('Courses')
                getData(viewLevel.courses)
            }
        }else {
            setHeading('Departments')
            getData(viewLevel.deps)
        }
        // eslint-disable-next-line
    }, [year, term, dep, num])


    function getBody(level) {
        if(level === viewLevel.courses) {
            return JSON.stringify({ year: year, term: term, dep: dep })
        }else if(level === viewLevel.sections) {
            return JSON.stringify({ year: year, term: term, dep: dep, num: num })
        }else {
            return JSON.stringify({ year: year, term: term })
        }
    }
    
    function handleError(level) {
        if(level === viewLevel.courses) {
            alert('404 Department Not Found')
            setDep('')
        }else if(level === viewLevel.sections) {
            alert('404 Section Not Found')
            setNum('')
        }else {
            window.alert('Something went wrong.. Please try again.')
        }
    }

    async function getData(level) {
        const body = getBody(level)
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        }

        setList([])
        setLoadingStatus(true)
        const result = await fetch('/api/admin', options)
        setLoadingStatus(false)
        if(result.status !== 200) {
            handleError(level)
            return
        }

        const data = await result.json()
        // console.log(data)
        setList(data)
    }


    function handleListItemClick(event) {
        if(dep === '') {
            setDep(event.currentTarget.id)
        }else if(num === '') {
            setNum(event.currentTarget.id)
        }
    }
    
    function handleBackBtnClick() {
        if(num !== '') {
            setNum('')
        }else {
            setDep('')
        }
    }


    
    function handleBtnClicked(event) {
        event.stopPropagation()
        
        const li = event.currentTarget.parentElement
        const dataset = li.dataset
        const status = Number(event.currentTarget.dataset.status)

        if(li) {

            if(num !== '') {
                // add, remove a section

                if(status === 0) {
                    addCourse(dataset.num, li.id, dataset.title, dataset.index)
                }else {
                    if(window.confirm('Confirm removal of ' + dep.toUpperCase() + (dataset.num).toUpperCase() + ' ' + li.id.toUpperCase() + '. This will result in all data related to this section being deleted.')) {
                        deleteCourse(dataset.num, li.id, dataset.index)
                    }
                    
                }
            }else if(dep !== '') {
                // add all, remove all sections
        
                if(status === 0) {
                    addCourse(li.id, '', '', dataset.index)
                }else {
                    // make db delete query for all records with (year, term, dep, num)
                    if(window.confirm('Confirm removal of all sections in ' + dep.toUpperCase() + li.id.toUpperCase() + '. This will result in all data related to all of the sections being deleted.')) {
                        deleteCourse(li.id, '', dataset.index)
                    }
                    
                }
            }
        }
    }

    function deleteCourse(coursenum, coursesection, index) {
        if(coursesection !== '') {
            // post request to the server
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: year, term: term, dep: dep, num: coursenum, section: coursesection})
            }
    
            fetch('/api/admin/delete-section', options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        updateList(index, 0)
                    })
                }
            })
        }else if(coursenum !== '') {
            // post request to the server
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: year, term: term, dep: dep, num: coursenum })
            }
            
            fetch('/api/admin/delete-course', options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        updateList(index, 0)
                    })
                }
            })
        }

    }

    function addCourse(coursenum, coursesection, coursetitle, index) {
        if(coursesection !== '') {
            // post request to the server
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: year, term: term, dep: dep, num: coursenum, section: coursesection, title: coursetitle })
            }

            fetch('/api/admin/add-section', options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        updateList(index, 1)
                    })
                }
            })
        }else if(coursenum !== '') {
            // post request to the server
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: year, term: term, dep: dep, num: coursenum })
            }
            
            fetch('/api/admin/add-course', options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        updateList(index, 1)
                    })
                }
            })
        }
    }


    // updates status at index i in list
    function updateList(index, status) {
        var updatedList = [...list]
        updatedList[index].status = status
        setList(updatedList)
    }



    return (
        <div className="course-list-viewer">
            <h3>{heading}</h3>
            <button onClick={handleBackBtnClick} id="backBtn" type="button" disabled={dep === ''}>Back</button>
            <span>/{dep}{num !== '' && '/' + num}</span>

            <ul>
                {loading && 
                    <div className="loader-wrapper">
                        <p>Loading data...</p>
                        <div className="loader"></div>
                    </div>
                }
                {list.map((item, index) => (
                    <li key={item.value} id={item.value} onClick={handleListItemClick} data-index={index} data-num={num} data-title={item.title}>
                        <span>{dep.toUpperCase()}{num.toUpperCase()} {item.value.toUpperCase()} {item.title}</span>
                        {/* buttons under view level: list of sections */}
                        {dep !== '' && num !== '' && item.status === 0 && <button data-status={item.status} className="add-btn" onClick={handleBtnClicked}>Add</button>}
                        {dep !== '' && num !== '' && item.status === 1 && <button data-status={item.status} className="add-btn" onClick={handleBtnClicked}>Remove</button>}
   
                        {/* buttons under view level: list of courses */}
                        {dep !== '' && num === '' && item.status === 0 && <button data-status={item.status} className="add-all-btn add-btn" onClick={handleBtnClicked}>Add all sections</button>}
                        {dep !== '' && num === '' && item.status === 1 && <button data-status={item.status} className="remove-btn add-btn" onClick={handleBtnClicked}>Remove all sections</button>}
                        {dep !== '' && num === '' && item.status === 2 && <button data-status={item.status} className="modify-btn add-btn" onClick={handleListItemClick}>Modify added sections</button>}
                    </li>
                ))}
            </ul>
        </div>
    )
}