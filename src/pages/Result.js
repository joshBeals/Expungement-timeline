import React, { useEffect, useState } from 'react';
import { useAppState } from '../store/AppStateContext';
import generateAlloyPredicate from '../helpers/generateAlloy';
import { Card, Spinner } from 'react-bootstrap';

const Result = () => {

    const { allscenarios, connections } = useAppState();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const sortedScenarios = allscenarios.sort((a, b) => {
            if (a.endYear === null) return 1;
            if (b.endYear === null) return -1;
            return a.startYear - b.startYear;
        });
        console.log(sortedScenarios);
        const result = generateAlloyPredicate(sortedScenarios, connections);
        console.log(result);
    }, [allscenarios, connections]);

    return (
        <div className='container-fluid'>
            {result ? (
                <div></div>
            ) : (
                <div
                    style={{
                        height: "100vh",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Card style={{ width: "20rem", textAlign: "center", padding: "20px" }}>
                        <Card.Body>
                            <Spinner animation="border" variant="primary" />
                            <Card.Text className="mt-3">Fetching result, please wait...</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Result;