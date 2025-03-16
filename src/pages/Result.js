import React, { useEffect, useState } from 'react';
import { useAppState } from '../store/AppStateContext';
import generateAlloyPredicate from '../helpers/generateAlloy';
import { Alert, Card, Spinner } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import TimelineResult from '../components/TimelineResult';
import { useNavigate } from 'react-router-dom';

const Result = () => {

    const { allscenarios, connections, interpretation } = useAppState();
    const [result, setResult] = useState(null);
    const [resultError, setResultError] = useState(false);
        
    const navigate = useNavigate();

    useEffect(() => {
        const sortedScenarios = allscenarios.sort((a, b) => {
            if (a.endYear === null) return 1;
            if (b.endYear === null) return -1;
            return a.startYear - b.startYear;
        });
        console.log(sortedScenarios);

        if (sortedScenarios.length === 0) {
            window.location.href = "/";
        } else {
            const alloyPredicate = generateAlloyPredicate(sortedScenarios, connections);
            console.log(alloyPredicate);
            console.log("interpretation: ", interpretation);

            // Define the payload
            const payload = {
                predicate: alloyPredicate,
                run: `run userDefinedPredicate for ${
                    sortedScenarios.length + 1
                    } Event, ${sortedScenarios.length + 1} Date`,
                type: interpretation
            };

            // Make the API call
            fetch("http://localhost:8080/api/alloy/evaluate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })
            .then((response) => response.json())
            .then((data) => {
                // Extract and sort the keys of the 'data' object
                if(data?.success == true) setResult(data);
                console.log("Success:", data);
            })
            .catch((error) => {
                setResultError(true);
                console.error("Error:", error);
            });
        }
    }, [allscenarios, connections, interpretation]);

    return (
        <div className='container-fluid'>
            {result ? (
                <>
                <Alert variant="primary" className='m-3'>
                    <Alert.Heading>Expungement Analysis Complete</Alert.Heading>
                    <p className='mt-3'>
                        The analysis is complete! Below, you will find a detailed assessment of the expungement eligibility 
                        based on the provided conviction data. This result takes into account waiting periods, conviction types, and applicable legal restrictions 
                        to determine which convictions qualify for expungement and which do not.
                    </p>
                    <hr />
                    <Button variant="outline-primary" onClick={() => navigate("/")}>
                        Go Back
                    </Button>
                </Alert>
                <div>
                    <TimelineResult result={result?.data} />
                </div>
                </>
            ) : resultError ? (
                    <div
                        style={{
                            height: "100vh",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Card className="border-danger" style={{ width: "20rem", textAlign: "center", padding: "20px" }}>
                            <Card.Body>
                                <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: "24px" }}></i>
                                <Card.Text className="mt-3">No Instance Found!</Card.Text>
                            </Card.Body>
                        </Card>
                    </div>
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
                )
            }
        </div>
    );
};

export default Result;