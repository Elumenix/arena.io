const React = require('react');
const ReactDOM = require('react-dom');
const app = require('./js/app');

const Leaderboard = () => {
    const [players, setPlayers] = React.useState([]);

    React.useEffect(() => {
        if (app.playerSocket) {
            console.log('Setting up listener');
            app.playerSocket.on('update leaderboard', data => {
                setPlayers(data);
            });
    
            return () => {
                console.log('Cleaning up listener');
                app.playerSocket.off('update leaderboard');
            };
        }
    }, [app.playerSocket]);

    return (
        <div>
            <h2>Leaderboard</h2>
            {players.sort((a, b) => b.score - a.score).map((player, index) => (
                <div key={index}>
                    <p><b>{player.name}:</b> {Math.round((Date.now() - player.startTime) / 100)}</p>
                </div>
            ))}
        </div>
    );
};

export {
    Leaderboard,
}