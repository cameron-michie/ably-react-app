import * as Ably from 'ably';
import React, { useState } from 'react';
import {
  useChannel,
  usePresence,
  usePresenceListener,
  useConnectionStateListener,
  useAbly,
} from 'ably/react';

import './App.css';

function App() {
  const [messages, updateMessages] = useState<Ably.Message[]>([]);
  const { publish, ably } = useChannel({ channelName: 'your-channel-name'}, (message) => {
    updateMessages((prev) => [...prev, message]);
  });

  const { updateStatus } = usePresence({ channelName: 'your-channel-name'}, { foo: 'bar' });
  const { presenceData } = usePresenceListener({ channelName: 'your-channel-name'}, (update) => {
    console.log(update);
  });

  const [, setConnectionState] = useState(ably.connection.state);

  useConnectionStateListener((stateChange) => {
    setConnectionState(stateChange.current);
  });


  const messagePreviews = messages.map((message, idx) => <MessagePreview key={idx} message={message} />);

  const presentClients = presenceData.map((msg, index) => (
    <li key={index}>
      {(msg as Ably.PresenceMessage).clientId}: {JSON.stringify(msg.data)}
    </li>
  ));

  return (
    <div className="App">
      <header className="App-header">Ably React Hooks Demo</header>
      <div style={{ width: '250px', padding: '10px' }}>
        <ConnectionState />
      </div>
      <div>
        <button
          onClick={() => {
            publish('test-message', {
              text: 'message text',
            });
          }}
        >
          Send Message
        </button>
        <button
          onClick={() => {
            updateStatus({ foo: 'baz' });
          }}
        >
          Update presence status to baz
        </button>
      </div>
        
      <div style={{ margin: '25px' }}>
        <h2>Messages</h2>
        <div style={{textIndent: '50px'}}> 
          <h2>Messages</h2>
          <ul>{messagePreviews}</ul> 
          <h2>Present Clients</h2>
          <ul>{presentClients}</ul>
        </div>
      </div>
    </div>
  );
}

function MessagePreview({ message }: { message: Ably.Message }) {
  return <li>{message.data.text}</li>;
}

function ConnectionState() {
  const ably = useAbly();
  const [connectionState, setConnectionState] = useState(ably.connection.state);
  const [connectionError, setConnectionError] = useState<Ably.ErrorInfo | null>(null);
  useConnectionStateListener((stateChange) => {
    console.log(stateChange);
    setConnectionState(stateChange.current);
    if (stateChange.reason) {
      setConnectionError(stateChange.reason);
    }
  });

  return (
    <>
      <p>Connection State = &apos;{connectionState}&apos;</p>
      {connectionError && (
        <p>
          Connection Error ={' '}
          <a href={(connectionError as any).href}>
            {connectionError.message} ({connectionError.code} {connectionError.statusCode})
          </a>
        </p>
      )}
    </>
  );
}

export default App;