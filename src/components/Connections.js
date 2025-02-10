import React from 'react';
import { useAppState } from '../store/AppStateContext';
import { Button, InputGroup } from 'react-bootstrap';

const Connections = () => {
    const { connections, removeConnection } = useAppState();

    return (
        <div className='my-5 mx-4 d-flex flex-wrap gap-3'>
            {connections.map(({ fromId, toId }) => (
                <InputGroup key={`${fromId}-${toId}`} className="w-auto">
                    <div className="border px-3 py-2 rounded-start bg-light">
                        <code>#{fromId} → #{toId}</code>
                    </div>
                    <Button 
                        variant="danger" 
                        onClick={() => removeConnection(fromId, toId)}
                    >
                        <i className="bi bi-x-circle"></i>
                    </Button>
                </InputGroup>
            ))}
        </div>
    );
}

export default Connections;
