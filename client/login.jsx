const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleLogin = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });

    return false;
}

const handleSignup = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });

    return false;
}

const LoginForm = (props) => {
    return (
        <form id="loginForm"
            name="loginForm"
            onSubmit={handleLogin}
            action="/login"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <input className="formSubmit" type="submit" value="Login" />
        </form>
    );
};

const SignupForm = (props) => {
    return (
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm"
        >
            <label htmlFor="username">Username: </label>
            <input id="user" type="text" name="username" placeholder="username" />
            <label htmlFor="pass">Password: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass">Confirm Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />
            <input className="formSubmit" type="submit" value="Sign up" />
        </form>
    );
};


const LoginWindow = () => {
    const [isLogin, setIsLogin] = React.useState(true);

    return (
        <div id="loginWindow">
            <div id="buttonTabs">
                <button onClick={() => setIsLogin(true)} style={{backgroundColor: isLogin ? 'lightgray' : 'dimgray'}}>
                    Login
                </button>
                <button onClick={() => setIsLogin(false)} style={{backgroundColor: !isLogin ? 'lightgray' : 'dimgray'}}>
                    Sign Up
                </button>
            </div>
            {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
    );
}

const init = () => {
    //const loginButton = document.getElementById('loginButton');
    //const signupButton = document.getElementById('signupButton');

    /*loginButton.addEventListener('click', (e) => {
        e.preventDefault();*/

    ReactDOM.render(<LoginWindow />,  document.getElementById('content'));

    
    //return false;
    //});

    /*signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        const signupDiv = document.createElement('div');
        document.getElementById('content').appendChild(signupDiv);
        ReactDOM.render(<SignupWindow />, signupDiv);
        return false;
    });

    const initialDiv = document.createElement('div');
    document.getElementById('content').appendChild(initialDiv);
    ReactDOM.render(<LoginWindow />, initialDiv);*/
};

init();
