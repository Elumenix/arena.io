const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
const app = require('./js/app.js');

const MainMenu = () => {
    return (
        <div id="mainMenu">
            <button id="startButton" onClick={() => {
                app.startGame('player');
                document.querySelector('#content').hidden = true;
            }}>
                Start
            </button>

            <button id="logoutButton" onClick={(e) => {
                e.preventDefault();
                fetch('/logout'); // sign user out

                // Bring back the login menu
                document.querySelector('#loginScreen').hidden = false;
                document.querySelector('#mainMenu').hidden = true;
            }}>
                Log Out
            </button>
        </div>
    );
}

const handleLogin = async (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or password is empty!');
        return false;
    }

    const result = await helper.sendPost(e.target.action, { username, pass });

    console.log(result);

    if (result.loggedIn) {
        document.querySelector("#loginScreen").hidden = true;
        ReactDOM.render(<MainMenu />, document.getElementById('content'));
        document.querySelector('#mainMenu').hidden = false;
    }

    return false;
}

const handleSignup = async (e) => {
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

    const result = await helper.sendPost(e.target.action, { username, pass, pass2 });

    if (result.loggedIn) {
        document.querySelector("#loginScreen").hidden = true;
        ReactDOM.render(<MainMenu />, document.getElementById('content'));
        document.querySelector('#mainMenu').hidden = false;
    }

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
    const [isUserLoggedIn, setIsUserLoggedIn] = React.useState(false);

    // On the first frame of this being rendered, client checks if user is logged in
    React.useEffect(() => {
        const checkLoginStatus = async () => {
            const response = await fetch('/menu');
            const data = await response.json();
            if (data.loggedIn === true) {
                document.querySelector("#loginScreen").hidden = true;
                ReactDOM.render(<MainMenu />, document.getElementById('content'));
                setIsUserLoggedIn(true);
            } else {
                setIsUserLoggedIn(false);
            }
        };
        checkLoginStatus();
    }, []);

    return (
        <div id="loginWindow">
            <div id="buttonTabs">
                <button onClick={() => setIsLogin(true)} style={{ backgroundColor: isLogin ? 'lightgray' : 'dimgray' }}>
                    Login
                </button>
                <button onClick={() => setIsLogin(false)} style={{ backgroundColor: !isLogin ? 'lightgray' : 'dimgray' }}>
                    Sign Up
                </button>
            </div>
            {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
    );
}

const init = () => {
    ReactDOM.render(<LoginWindow />, document.getElementById('loginScreen'));
};

init();
