import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import generateYearRange from '../helpers/generateYearRange';
import { useAppState } from '../store/AppStateContext';
import determineYearType from '../helpers/determineYearType';

const ScenarioForm = ({ scenario = null }) => {
    console.log(scenario);
    const currentYear = new Date().getFullYear();
    const years = generateYearRange(1960, currentYear).sort((a, b) => b - a);

    const { addScenario, editScenario, setShowForm } = useAppState();

    // ✅ State Initialization
    const [convictionType, setConvictionType] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(false);
    const [alreadyExpunged, setAlreadyExpunged] = useState(false);
    const [yearType, setYearType] = useState('');
    const [question, setQuestion] = useState('');

    // ✅ Pre-fill form when scenario changes (for editing)
    useEffect(() => {
        if (scenario) {
            setConvictionType(scenario.name || '');
            setSelectedYear(scenario.startYear || '');
            setStartYear(scenario.startYear || '');
            setEndYear(scenario.endYear || '');
            setIsChecked(scenario.assaultive || false);
            setIsChecked1(scenario.tenner || false);
            setIsChecked2(scenario.owi || false);
            setAlreadyExpunged(scenario.alreadyExpunged || false);
            setQuestion(scenario.question || '');

            if (!scenario?.startYear || !scenario?.endYear) {
                setYearType('');
            }else if (scenario?.startYear == scenario?.endYear) {
                setYearType('single');
            } else {
                setYearType('range');
            }
        }
    }, [scenario]);

    const handleSingle = (value) => {
        setSelectedYear(value);
        setStartYear(value);
        setEndYear(value);
    };

    const handleSubmit = () => {
        let error = false;
        let errorMessage = '';

        if (yearType === 'range' && (!startYear || !endYear || parseInt(endYear, 10) < parseInt(startYear, 10))) {
            error = true;
            errorMessage = 'Please enter a valid date range!';
        }
        if (yearType === 'single' && !selectedYear) {
            error = true;
            errorMessage = 'Please pick a year!';
        }

        if (error) {
            alert(errorMessage);
            return;
        }

        const newScenario = {
            id: scenario?.id || Date.now(),
            type: convictionType || "Conviction",
            yearType: determineYearType(startYear, endYear),
            startYear: yearType ? startYear : '',
            endYear: yearType ? endYear : '',
            assaultive: isChecked,
            tenner: isChecked1,
            owi: isChecked2,
            alreadyExpunged,
            question
        };

        if (scenario) {
            editScenario(newScenario);
        } else {
            addScenario(newScenario);
        }

        setShowForm(false);
    };

    return (
        <Form>
            <Alert variant="primary">
                You can leave certain things unspecified by selecting "Leave Unspecified."
            </Alert>

            {/* Conviction Type Selection */}
            <Row>
                <Col xs={12}>
                    <Form.Label className="fw-bolder">Select Conviction Type</Form.Label>
                    <Form.Select value={convictionType} onChange={(e) => setConvictionType(e.target.value)}>
                        <option value="">Leave Unspecified</option>
                        <option value="Felony">Felony</option>
                        <option value="Misdemeanor">Misdemeanor</option>
                    </Form.Select>
                </Col>

                {convictionType && (
                    <>
                        {convictionType !== 'Conviction' && (
                            <Col className="mt-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Assaultive"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                />
                            </Col>
                        )}
                        {convictionType === 'Felony' && (
                            <Col className="mt-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Ten Year Felony"
                                    checked={isChecked1}
                                    onChange={(e) => setIsChecked1(e.target.checked)}
                                />
                            </Col>
                        )}
                        {convictionType === 'Misdemeanor' && (
                            <Col className="mt-2">
                                <Form.Check
                                    type="checkbox"
                                    label="OWI"
                                    checked={isChecked2}
                                    onChange={(e) => setIsChecked2(e.target.checked)}
                                />
                            </Col>
                        )}
                    </>
                )}
            </Row>

            {/* Conviction Year Selection */}
            <Col xs={12} className="mt-3">
                <Form.Label className="fw-bolder">When did this conviction occur?</Form.Label>
                <div className="mb-3">
                    <Form.Check
                        inline
                        label="Single Year"
                        type="radio"
                        value="single"
                        checked={yearType === 'single'}
                        onChange={(e) => setYearType(e.target.value)}
                    />
                    <Form.Check
                        inline
                        label="Date Range"
                        type="radio"
                        value="range"
                        checked={yearType === 'range'}
                        onChange={(e) => setYearType(e.target.value)}
                    />
                    <Form.Check
                        inline
                        label="Leave Unspecified"
                        type="radio"
                        value=""
                        checked={yearType === ''}
                        onChange={(e) => setYearType(e.target.value)}
                    />
                </div>

                {yearType === 'single' && (
                    <Form.Select value={selectedYear} onChange={(e) => handleSingle(e.target.value)}>
                        <option value="">Select Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Form.Select>
                )}

                {yearType === 'range' && (
                    <Row>
                        <Col xs={6}>
                            <Form.Select value={startYear} onChange={(e) => setStartYear(e.target.value)}>
                                <option value="">Start Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col xs={6}>
                            <Form.Select value={endYear} onChange={(e) => setEndYear(e.target.value)}>
                                <option value="">End Year</option>
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>
                )}
            </Col>

            {/* Expungement Status */}
            <Col xs={12} className="mt-3">
                <Form.Label className="fw-bolder">Has this conviction been expunged?</Form.Label>
                <div className="mb-3">
                    <Form.Check inline label="Yes" type="radio" value="true" checked={alreadyExpunged === true} onChange={() => setAlreadyExpunged(true)} />
                    <Form.Check inline label="No" type="radio" value="false" checked={alreadyExpunged === false} onChange={() => setAlreadyExpunged(false)} />
                </div>
            </Col>

            {/* Question Selection */}
            <Col xs={12} className="mt-3">
                <Form.Label className="fw-bolder">What do you want to know about this conviction?</Form.Label>
                <Form.Check inline label="expunged?" type="radio" value="expunged" checked={question === 'expunged'} onChange={(e) => setQuestion(e.target.value)} />
                <Form.Check inline label="unexpunged?" type="radio" value="unexpunged" checked={question === 'unexpunged'} onChange={(e) => setQuestion(e.target.value)} />
                <Form.Check inline label="I'm not sure" type="radio" value="" checked={question === ''} onChange={(e) => setQuestion(e.target.value)} />
            </Col>

            {/* Submit Button */}
            <Col xs={12} className="mt-3">
                <Button onClick={handleSubmit} variant="primary" className="w-100">
                    {scenario ? 'Update' : 'Add'}
                </Button>
            </Col>
        </Form>
    );
};

export default ScenarioForm;
