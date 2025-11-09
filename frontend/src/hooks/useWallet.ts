"use client";

import { useCallback } from "react";
import { Connector, useAccount, useConnect, useDisconnect } from "wagmi";

type ConnectOptions = {
    connectorId?: Connector["id"];
};

export function useWallet() {
    const { address, status } = useAccount();
    const { connectAsync, connectors, isPending, pendingConnector } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const connect = useCallback(
        async ({ connectorId }: ConnectOptions = {}) => {
            const connector =
                connectorId !== undefined
                    ? connectors.find((item) => item.id === connectorId)
                    : connectors[0];

            if (!connector) {
                throw new Error("No wallet connector available");
            }

            await connectAsync({ connector });
        },
        [connectAsync, connectors],
    );

    const disconnect = useCallback(async () => {
        await disconnectAsync();
    }, [disconnectAsync]);

    return {
        address,
        isConnected: status === "connected",
        isConnecting: status === "connecting" || isPending,
        connectors,
        pendingConnector,
        connect,
        disconnect,
    };
}



