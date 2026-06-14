import { login, register } from '../services/authService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    })
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            if (isLogin) {
                const data = await login(formData.email, formData.password);
                localStorage.setItem('token', data.token);
            } else {
                await register(formData.name, formData.username, formData.email, formData.password);
                const loginData = await login(formData.email, formData.password);
                localStorage.setItem('token', loginData.token);
            }
            navigate('/dashboard');
        }
        catch (err) {
            console.log(err)
        }
    }


    return (
        <div> 
            <h1>{isLogin ? 'Login' : 'Register' }</h1>

            {!isLogin &&
                <>
                    <input
                        type='text'
                        placeholder='Name'
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />

                    <input
                        type='text'
                        placeholder='Username'
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                </>
            }

            <input
                type='email'
                placeholder='Email'
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <input
                type='password'
                placeholder='Password'
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
            />  

            <button onClick={handleSubmit}>
                {isLogin ? 'Login' : 'Register'}
            </button>

            <p onClick={() => setIsLogin(!isLogin)}> 
                {isLogin ? 'Not registered? Register' : 'Already have an account? Login'}
            </p>
        </div>
    )
}
export default Auth