import { createContext } from "react";

const ConnectionUpdatesContext = createContext({
    updateConnections: false,
    setUpdateConnections: () => {},
})

export default ConnectionUpdatesContext