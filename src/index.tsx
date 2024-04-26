import React from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Ably from 'ably';
import App from './App';
import { AblyProvider, ChannelProvider } from 'ably/react';

const rootId = 'root';
const container = document.getElementById(rootId);

if (!container) {
  throw new Error(`No element found with id #${rootId} found`);
}

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

const client = new Ably.Realtime({
  key: "vp3f2w.UsKYIA:MbRVmEjqpkWHNE8owf08ckcFw1tc6UcUNgLu9thSgjc",
  clientId: generateRandomId(),
});

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AblyProvider client={client}>
      <AblyProvider ablyId="rob" client={client}>
        <AblyProvider ablyId="frontOffice" client={client}>
          <ChannelProvider channelName="your-channel-name" options={{ modes: ['PRESENCE', 'PUBLISH', 'SUBSCRIBE'] }}>
            <ChannelProvider channelName="your-derived-channel-name">
              <ChannelProvider
                ablyId="rob"
                channelName="your-derived-channel-name"
                deriveOptions={{ filter: 'headers.email == `"rob.pike@domain.com"` || headers.company == `"domain"`' }}
              >
                <ChannelProvider
                  ablyId="frontOffice"
                  channelName="your-derived-channel-name"
                  deriveOptions={{ filter: 'headers.role == `"front-office"` || headers.company == `"domain"`' }}
                >
                  <App />
                </ChannelProvider>
              </ChannelProvider>
            </ChannelProvider>
          </ChannelProvider>
        </AblyProvider>
      </AblyProvider>
    </AblyProvider>
  </React.StrictMode>,
);