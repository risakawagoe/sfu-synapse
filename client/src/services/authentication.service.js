// returns true if unauthorized, false if logged in
export async function requiresLogin(userType) {

    const response = await fetch('/api/checkLoginStatus/' + userType)
    if(response.status === 401) {
        return true
    }

    return false
}