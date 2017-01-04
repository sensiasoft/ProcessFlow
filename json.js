var package = {
    AggregateProcess: {
        _inputs: {
            seaWaterPressure: null,
            seaWaterTemperature: null,
            volumetricBackscatter: null,
            particleMotion: null,
            tilt: null,
            heading: null,
            temperature: null
        },
        _outputs: {
            Pressure_QC_ChainOutputs: {
                cleanedPressureTimeSeries: null,
                dataGapFlag: null,
                aggregatePressureFlag: null
            },
            PressureObsProcessOutputs: {
                meanSeaWaterPressure: null,
                waveHeightFromPressure: null,
                wavePeriodFromPressure: null,
                loCutoffFrequency: null,
                hiCutoffFrequency: null
            },
            Velocity_QC_Chain: {
                interpolatedVelocityTimeSeries: null,
                topBinFlag: null,
                aggregateVelocityFlag: null,
                echoIntensityFlag: null,
                cMFlag: null
            },
            VelocityObsProcessOutputs: {
                waveHeightAll: null,
                swell: null,
                windWaves: null,
                windPeriodAll: null,
                swellPeriod: null,
                windWavePeriod: null,
                dominantWaveDirection: null,
                swellDirection: null,
                windWaveDirection: null,
                topBinHeight: null,
                bottomBinHeight: null
            },
            flags: null
        },
        _components: {
            MVCO_Workhorse: {
                _inputs: {
                    seaWaterPressure: null,
                    seaWaterTemperature: null,
                    volumetricBackscatter: null,
                    particleMotion: null,
                    temperature: null,
                    tilt: null,
                    heading: null
                },
                _outputs: {
                    ADCP_outputs: {
                        pressure: null,
                        temperature: null,
                        velocity: null,
                        beamIntensity: null,
                        correlationCoefficient: null
                    },
                    pressureTimeSeries: null,
                    velocityTimeSeries: null
                },
                _parameters: {
                    dopplerParameters: null,
                    CommunicationsParameters: null
                }
            },
            Pressure_QC_Chain: {
                _inputs: {
                    pressureTimeSeries: null,
                },
                _outputs: {
                    cleanedPressureTimeSeries: null,
                    aggregatePressureFlag: null,
                    dataGapFlag: null
                },
                _parameters: {
                    timeContinuityParams: null,
                    rangeParams: null,
                    spikeParams: null,
                    minimumPercent: null,
                    InterpParams: null
                }
            },
            PressureObservableProcess: {
                _inputs: {
                    interpolatedPressureTimeSeries: null
                },
                _outputs: {
                    waveHeightFromPressure: null,
                    wavePeriodFromPressure: null,
                    loCutoffFrequency: null,
                    hiCutoffFrequency: null
                }
            },
            VelocityObservableProcess: {
                _inputs: {
                    interpolatedPressureTimeSeries: null,
                    interpolatedVelocityTimeSeries: null
                },
                _outputs: {
                    waveHeightAll: null,
                    swell: null,
                    windWaves: null,
                    wavePeriodAll: null,
                    swellPeriod: null,
                    windWavePeriod: null,
                    dominantWaveDirection: null,
                    swellDirection: null,
                    windWaveDirection: null,
                    topBinHeight: null,
                    bottomBinHeight: null
                }
            },
            Velocity_QC_Chain: {
                _inputs: {
                    velocityTimeSeries: null
                },
                _outputs: {
                    interpolatedVelocityTimeSeries: null,
                    aggregateVelocityFlag: null,
                    echoIntensityFlag: null,
                    correlationCoefficientFlag: null
                }
            },
            PUV_Analysis: null
        },
        _connections: [
            {
                source: "_inputs.seaWaterPressure",
                destination: "_components.MVCO_Workhorse_inputs.seaWaterPressure"
            },
            {
                source: "_inputs.volumetricBackscatter",
                destination: "_components.MVCO_Workhorse_inputs.volumetricBackscatter"
            },
            {
                source: "_inputs.particleMotion",
                destination: "_components.MVCO_Workhorse_inputs.particleMotion"
            },
            {
                source: "_inputs.tilt",
                destination: "_components.MVCO_Workhorse_inputs.tilt"
            },
            {
                source: "_inputs.heading",
                destination: "_components.MVCO_Workhorse_inputs.heading"
            },
            {
                source: "_inputs.temperature",
                destination: "_components.MVCO_Workhorse_inputs.temperature"
            },
            {
                source: "_components.MVCO_Workhorse._outputs.pressureTimeSeries",
                destination: "_components.Pressure_QC_Chain._inputs.pressureTimeSeries"
            },
            {
                source: "_components.MVCO_Workhorse._outputs.velocityTimeSeries",
                destination: "_components.Velocity_QC_Chain._inputs.velocityTimeSeries"
            },
            {
                source: "_components.Pressure_QC_Chain._outputs.cleanedPressureTimeSeries",
                destination: "_components.PressureObservableProcess._inputs.interpolatedPressureTimeSeries"
            },
            {
                source: "_components.Pressure_QC_Chain._outputs.cleanedPressureTimeSeries",
                destination: "_components.VelocityObservableProcess._inputs.interpolatedVelocityTimeSeries"
            },
            {
                source: "_components.Pressure_QC_Chain._outputs.aggregatePressureFlag",
                destination: "_outputs.flags"
            },
            {
                source: "_components.Velocity_QC_Chain._outputs.interpolatedVelocityTimeSeries",
                destination: "_components.VelocityObservableProcess._inputs.interpolatedVelocityTimeSeries"
            },
            {
                source: "_components.Velocity_QC_Chain._outputs.aggregateVelocityFlag",
                destination: "_outputs.flags"
            },
            {
                source: "_components.Velocity_QC_Chain._outputs.echoIntensityFlag",
                destination: "_outputs.flags"
            },
            {
                source: "_components.Velocity_QC_Chain._outputs.correlationCoefficientFlag",
                destination: "_outputs.flags"
            },
            {
                source: "_components.PressureObservableProcess._outputs.waveHeightFromPressure",
                destination: "_outputs.PressureObsProcessOutputs.waveHeightFromPressure"
            },
            {
                source: "_components.PressureObservableProcess._outputs.wavePeriodFromPressure",
                destination: "_outputs.PressureObsProcessOutputs.wavePeriodFromPressure"
            },
            {
                source: "_components.PressureObservableProcess._outputs.loCutoffFrequency",
                destination: "_outputs.PressureObsProcessOutputs.loCutoffFrequency"
            },
            {
                source: "_components.PressureObservableProcess._outputs.hiCutoffFrequency",
                destination: "_outputs.PressureObsProcessOutputs.hiCutoffFrequency"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.waveHeightAll",
                destination: "_outputs.VelocityObsProcessOutputs.waveHeightAll"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.swell",
                destination: "_outputs.VelocityObsProcessOutputs.swell"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.windWaves",
                destination: "_outputs.VelocityObsProcessOutputs.windWaves"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.wavePeriodAll",
                destination: "_outputs.VelocityObsProcessOutputs.wavePeriodAll"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.swellPeriod",
                destination: "_outputs.VelocityObsProcessOutputs.swellPeriod"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.windWavePeriod",
                destination: "_outputs.VelocityObsProcessOutputs.windWavePeriod"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.dominantWaveDirection",
                destination: "_outputs.VelocityObsProcessOutputs.dominantWaveDirection"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.swellDirection",
                destination: "_outputs.VelocityObsProcessOutputs.swellDirection"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.windWaveDirection",
                destination: "_outputs.VelocityObsProcessOutputs.windWaveDirection"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.topBinHeight",
                destination: "_outputs.VelocityObsProcessOutputs.topBinHeight"
            },
            {
                source: "_components.VelocityObservableProcess._outputs.bottomBinHeight",
                destination: "_outputs.VelocityObsProcessOutputs.bottomBinHeight"
            }
        ]
    }
}













