import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import CourseSelector from "../../components/CourseSelector/CourseSelector"
import { requiresLogin } from "../../services/authentication.service"
import './AccountSetup.css'

export default function AccountSetup() {
    const navigate = useNavigate()
    const bioMaxLen = 150
    const [bioLen, setBioLen] = useState(0)
    const [list, setList] = useState([])
    const [photo, setPhoto] = useState({})

    const [year] = useState(() => {
        return getYearAndTerm().year
    })
    
    const [term] = useState(() => {
        return getYearAndTerm().term
    })

    useEffect(() => {
        async function init() {
            // check login status
            if(await requiresLogin('user')) {
                navigate('/signup', { replace: true })
            }
        }
        init()
    }, [])


    async function handleBtnClick() {
               
        // 1 remove existing courses which are labeled as not to keep
        const promises1 = list.filter((item) => {
            return item.keep === false
        }).map((item) => {
            const url = `/api/${year}/${term}/${item.dep}/${item.num}/${item.section}`
            return fetch(url, { method: 'DELETE' })
        })
        await Promise.all(promises1)
        // console.log('Removed courses')
        
        // 2 add new courses
        const promises2 = list.filter((item) => {
            return item.keep && item.new_item
        }).map((item) => {
            const url = `/api/${year}/${term}/${item.dep}/${item.num}/${item.section}`
            return fetch(url, { method: 'POST' })
        })
        await Promise.all(promises2)
        // console.log('Added new courses')
        
        // 3 update user's bio
        const bio = document.getElementById('bioTextarea')
        // console.log(bio.value)
        if(bio.value !== '') {
            const options = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: bio.value })
            }
            const result = await fetch('/api/setup/bio', options)
            if(result.status !== 200) {
                const msg = await result.json()
                // console.log(msg)
                return
            }else {
                // console.log('Profile bio saved')
            }
        }

        // 4 update user's profile
        if(photo.data) {
            const data = new FormData()
            data.append('file', photo.data)

            const options = {
                method: 'POST',
                body: data
            }
            const response = await fetch('/api/user-photo', options)
            const result = await response.json()

            if(response.status !== 200) {
                alert(result)
                return
            }

            // console.log('Profile photo saved')
        }


        // console.log('Account setup Completed!!')
        navigate("/", {replace: true})
    }


    function checkWordCount(event) {
        setBioLen(event.target.value.length)
    }

    const updateList = (list) => {
        setList(list)
    }


    function handleFileChange(event) {
        if(event.target.files && event.target.files[0]) {
            const file = event.target.files[0]

            if(sizeInKB(file.size) <= 200) {
                const img = {
                    preview: URL.createObjectURL(file),
                    data: file
                }
                setPhoto(img)
                // console.log(photo)
            }else {
                setPhoto({})
                event.target.value = ''
                alert('[File size: ' + sizeInKB(file.size) + ' KB] The maximum file size allowed is 200KB.')
            }
        }else {
            setPhoto({})
        }
    }

    function handleSkipBtnClick() {
        navigate('/', { replace: true })
    }


    // helper function
    function getYearAndTerm() {
        const time = new Date()
        const year = time.getFullYear()
        const month = time.getMonth() + 1

        if(month < 5) {
            return { year: year, term: 'spring'}
        }else if(month < 9) {
            return { year: year, term: 'summer'}
        }else {
            return { year: year, term: 'fall'}
        }
    }
    

    function sizeInKB(bytes, decimals = 2) {
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        return parseFloat((bytes / k).toFixed(dm))
    }

    


    return (
        <div className="account-setup">
            <section className="wrapper">
                <h1>Account setup</h1>
                <section className="course-selection">
                    <CourseSelector year={year} term={term} updateParentList={updateList} setup={true} />
                </section>
                <section className="photo">
                    <h5>Profile photo</h5>
                    {photo.preview && <img src={photo.preview} width='100' height='100' />}
                    <input type="file" accept="image/*" name="file" id="profilePhoto" className="form-control" onChange={handleFileChange} />
                    <p><small>The maximum file size allowed is 200KB.</small></p>
                </section>
                <section className="bio">
                    <h5>Bio</h5>
                    <textarea id="bioTextarea" className="form-control" onChange={checkWordCount} />
                    <small><span className={`${bioLen > bioMaxLen ? 'invalid' : ''}`}>{bioLen}</span> / {bioMaxLen}</small>
                </section>
                <div className="submit-btn">
                    <button type="button" id="skipBtn" className="btn btn-light" onClick={handleSkipBtnClick}>Skip</button>
                    <button type="button" id="completeBtn" className="btn btn-light" onClick={handleBtnClick} disabled={bioLen > bioMaxLen}>Complete account setup</button>
                </div>
            </section>
        </div>
    )
}