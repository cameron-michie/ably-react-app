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

  interface PresenceDataItem {
    clientId: string;
    connectionId: string;
    timestamp: number;
    encoding: string;
    data: any; // You can further specify this type if you know the structure of `data`.
    action: number; // Assuming action is a number, change this according to the actual expected type.
  }
  
  const [restPresenceData, setRestPresenceData] = useState<PresenceDataItem[]>([]);

  const fetchPresenceData = async () => {
      const response = await fetch('https://rest.ably.io/channels/your-channel-name/presence', {
        headers: {
          'Authorization': `Basic dnAzZjJ3LlVzS1lJQTpNYlJWbUVqcXBrV0hORThvd2YwOGNrY0Z3MXRjNlVjVU5nTHU5dGhTZ2pj`,
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRestPresenceData(data);
    }

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
          Send message
        </button>

        <button
          onClick={() => {
            console.log(presenceData);          
          }}
        >
          console.log(presence data from usePresenceListener)
        </button>

        <button
          onClick={() => {
            updateStatus({ foo: 'baz' });
          }}
        >
          Update presence status to baz
        </button>

        <button
          onClick={fetchPresenceData}
        >
          Query REST API presence members
        </button>
      </div>
        
      <div style={{ margin: '25px' }}>
        <h2>Messages</h2>
        <div style={{textIndent: '50px'}}> 
          <h2>Messages</h2>
          <ul>{messagePreviews}</ul> 
          <h2>Present Clients from usePresenceListener</h2>
          <ul>{presentClients}</ul>
          <h2>REST Presence Retrieve</h2>
          {restPresenceData.length > 0 ? (
          <ul>
            {restPresenceData.map((item, index) => (
              <li key={index}>
                <p>{item.clientId}: {JSON.stringify(item.data)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No REST presence data loaded</p>
        )}
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