import React from 'react';
import {
    View,
    ScrollView,
    Text,
    Button,
    TextInput,
    PermissionsAndroid,
    Platform
} from 'react-native';

import {
    Picker
} from '@react-native-picker/picker';

import {
    InterfaceType,
    StarConnectionSettings,
    StarXpandCommand,
    StarPrinter,
    StarSpoolJobSettings
} from 'react-native-star-io10';

interface AppProps {
}

interface AppState {
    interfaceType: InterfaceType;
    identifier: string;
    statusText: string;
    jobId: string;
}

class App extends React.Component<AppProps, AppState> {
    private _onPressPrintButton = async() => {
        var settings = new StarConnectionSettings();
        settings.interfaceType = this.state.interfaceType;
        settings.identifier = this.state.identifier;
        // settings.autoSwitchInterface = true;

        // If you are using Android 12 and targetSdkVersion is 31 or later,
        // you have to request Bluetooth permission (Nearby devices permission) to use the Bluetooth printer.
        // https://developer.android.com/about/versions/12/features/bluetooth-permissions
        if (Platform.OS == 'android' && 31 <= Platform.Version) {
            if (this.state.interfaceType == InterfaceType.Bluetooth || settings.autoSwitchInterface == true) {
                var hasPermission = await this._confirmBluetoothPermission();

                if (!hasPermission) {
                    console.log(`PERMISSION ERROR: You have to allow Nearby devices to use the Bluetooth printer`);
                    return;
                }
            }
        }

        var printer = new StarPrinter(settings);

        try {
            var builder = new StarXpandCommand.StarXpandCommandBuilder();
            builder.addDocument(new StarXpandCommand.DocumentBuilder()
            .addPrinter(new StarXpandCommand.PrinterBuilder()
                .actionPrintImage(new StarXpandCommand.Printer.ImageParameter("logo_01.png", 406))
                .styleInternationalCharacter(StarXpandCommand.Printer.InternationalCharacterType.Usa)
                .styleCharacterSpace(0)
                .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                .actionPrintText("Star Clothing Boutique\n" +
                                "123 Star Road\n" +
                                "City, State 12345\n" +
                                "\n")
                .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
                .actionPrintText("Date:MM/DD/YYYY    Time:HH:MM PM\n" +
                                "--------------------------------\n" +
                                "\n")
                .actionPrintText("SKU         Description    Total\n" +
                                "300678566   PLAIN T-SHIRT  10.99\n" +
                                "300692003   BLACK DENIM    29.99\n" +
                                "300651148   BLUE DENIM     29.99\n" +
                                "300642980   STRIPED DRESS  49.99\n" +
                                "300638471   BLACK BOOTS    35.99\n" +
                                "\n" +
                                "Subtotal                  156.95\n" +
                                "Tax                         0.00\n" +
                                "--------------------------------\n")
                .actionPrintText("Total     ")
                .add(new StarXpandCommand.PrinterBuilder()
                    .styleMagnification(new StarXpandCommand.MagnificationParameter(2, 2))
                    .actionPrintText("   $156.95\n")
                )
                .actionPrintText("--------------------------------\n" +
                                "\n" +
                                "Charge\n" +
                                "156.95\n" +
                                "Visa XXXX-XXXX-XXXX-0123\n" +
                                "\n")
                .add(new StarXpandCommand.PrinterBuilder()
                    .styleInvert(true)
                    .actionPrintText("Refunds and Exchanges\n")
                )
                .actionPrintText("Within ")
                .add(new StarXpandCommand.PrinterBuilder()
                    .styleUnderLine(true)
                    .actionPrintText("30 days")
                )
                .actionPrintText(" with receipt\n")
                .actionPrintText("And tags attached\n" +
                                "\n")
                .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
                .actionPrintBarcode(new StarXpandCommand.Printer.BarcodeParameter('0123456',
                                    StarXpandCommand.Printer.BarcodeSymbology.Jan8)
                                    .setBarDots(3)
                                    .setBarRatioLevel(StarXpandCommand.Printer.BarcodeBarRatioLevel.Level0)
                                    .setHeight(5)
                                    .setPrintHri(true))
                .actionFeedLine(1)
                .actionPrintQRCode(new StarXpandCommand.Printer.QRCodeParameter('Hello World.\n')
                                    .setModel(StarXpandCommand.Printer.QRCodeModel.Model2)
                                    .setLevel(StarXpandCommand.Printer.QRCodeLevel.L)
                                    .setCellSize(8))
                .actionCut(StarXpandCommand.Printer.CutType.Partial)
                )
            );

            var commands = await builder.getCommands();

            await printer.open();

            var jobSettings = new StarSpoolJobSettings(true, 30, "Print from ReactNative");

            var jobId = await printer.print(commands, jobSettings);
            console.log(`jobID: ${String(jobId)}`);

            this.setState({jobId: `${String(jobId)}`});

            console.log(`Success`);
        }
        catch(error) {
            console.log(`Error: ${String(error)}`);

            this.setState({statusText: this.state.statusText + `Error: ${String(error)}\n\n`});
        }
        finally {
            await printer.close();
            await printer.dispose();
        }
    }

    private _onPressGetJobStatusButton = async() => {
        var settings = new StarConnectionSettings();
        settings.interfaceType = this.state.interfaceType;
        settings.identifier = this.state.identifier;
        // settings.autoSwitchInterface = true;

        // If you are using Android 12 and targetSdkVersion is 31 or later,
        // you have to request Bluetooth permission (Nearby devices permission) to use the Bluetooth printer.
        // https://developer.android.com/about/versions/12/features/bluetooth-permissions
        if (Platform.OS == 'android' && 31 <= Platform.Version) {
            if (this.state.interfaceType == InterfaceType.Bluetooth || settings.autoSwitchInterface == true) {
                var hasPermission = await this._confirmBluetoothPermission();

                if (!hasPermission) {
                    console.log(`PERMISSION ERROR: You have to allow Nearby devices to use the Bluetooth printer`);
                    return;
                }
            }
        }

        var jobId = parseInt(this.state.jobId);

        if (isNaN(jobId)) {
            console.log(`jobID is not a number.\n`);

            this.setState({statusText: this.state.statusText + `Error: jobID is not a number.\n\n`});
            return;
        }

        var printer = new StarPrinter(settings);

        try {
            await printer.open();
            var jobStatus = await printer.getSpoolJobStatus(jobId);

            console.log(
                `jobID : ${String(jobStatus.jobId)}, ` +
                `jobState : ${String(jobStatus.jobState)}, ` +
                `elapsedTime : ${String(jobStatus.elapsedTime)}, ` +
                `jobReceivedInterface : ${String(jobStatus.jobReceivedInterface)}, ` +
                `appInfo : ${String(jobStatus.appInfo)}, ` +
                `hostModel : ${String(jobStatus.hostModel)}, ` +
                `hostOS : ${String(jobStatus.hostOS)}, ` +
                `hostIpAddress : ${String(jobStatus.hostIpAddress)}, ` +
                `jobSettings : ` +
                `isRetryEnabled : ${String(jobStatus.jobSettings.isRetryEnabled)}, ` +
                `timeout : ${String(jobStatus.jobSettings.timeout)}, ` +
                `note : ${String(jobStatus.jobSettings.note)}`
            );

            this.setState({statusText: this.state.statusText +
                `jobID : ${String(jobStatus.jobId)}, ` +
                `jobState : ${String(jobStatus.jobState)}, ` +
                `elapsedTime : ${String(jobStatus.elapsedTime)}, ` +
                `jobReceivedInterface : ${String(jobStatus.jobReceivedInterface)}, ` +
                `appInfo : ${String(jobStatus.appInfo)}, ` +
                `hostModel : ${String(jobStatus.hostModel)}, ` +
                `hostOS : ${String(jobStatus.hostOS)}, ` +
                `hostIpAddress : ${String(jobStatus.hostIpAddress)}, ` +
                `jobSettings : ` +
                `isRetryEnabled : ${String(jobStatus.jobSettings.isRetryEnabled)}, ` +
                `timeout : ${String(jobStatus.jobSettings.timeout)}, ` +
                `note : ${String(jobStatus.jobSettings.note)}\n`});

            console.log(`Success`);
        }
        catch(error) {
            console.log(`Error: ${String(error)}`);

            this.setState({statusText: this.state.statusText + `Error: ${String(error)}\n\n`});
        }
        finally {
            await printer.close();
            await printer.dispose();
        }
    }
 
    private async _confirmBluetoothPermission(): Promise<boolean> {
        var hasPermission = false;

        try {
            hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
    
            if (!hasPermission) {
                const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
                    
                hasPermission = status == PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        catch (err) {
            console.warn(err);
        }

        return hasPermission;
    }

    constructor(props: any) {
        super(props);

        this.state = {
            interfaceType: InterfaceType.Lan,
            identifier: '00:11:62:00:00:00',
            statusText: '\n',
            jobId: ''
        };
    }

    render() {
        return (
            <View style={{ flex: 1, margin: 50 }}>
                <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 100 }}>Interface</Text>
                <Picker
                    style={{ width: 200, marginLeft: 20, justifyContent: 'center' }}
                    selectedValue={this.state.interfaceType}
                    onValueChange={(value) => {
                    this.setState({ interfaceType: value });
                    }}>
                    <Picker.Item label='LAN' value={InterfaceType.Lan} />
                    <Picker.Item label='Bluetooth' value={InterfaceType.Bluetooth}/>
                    <Picker.Item label='Bluetooth LE' value={InterfaceType.BluetoothLE}/>
                    <Picker.Item label='USB' value={InterfaceType.Usb} />
                </Picker>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 30 }}>
                <Text style={{ width: 100 }}>Identifier</Text>
                <TextInput
                    style={{ width: 200, marginLeft: 20 }}
                    value={this.state.identifier}
                    onChangeText={(value) => {
                    this.setState({ identifier: value });
                    }}
                />
                </View>
                <View style={{ marginTop: 20, justifyContent: 'center' }}>
                <Button
                    title="Spool Print"
                    onPress={this._onPressPrintButton}
                />
                </View>
                <View style={{ flexDirection: 'row', marginTop: 30 }}>
                <TextInput
                    style={{ width: 100, marginLeft: 20 }}
                    value={this.state.jobId}
                    placeholder="jobID"
                    onChangeText={(value) => {
                    this.setState({ jobId: value });
                    }}
                />
                <View style={{ width: 150, marginLeft: 20 }}>
                <Button
                    title="Get Job Status"
                    onPress={this._onPressGetJobStatusButton}
                />
                </View>
                </View>
                <View style={{flex: 1, alignSelf: 'stretch', marginTop: 20}}>
                    <ScrollView>
                        <Text>{this.state.statusText}</Text>
                    </ScrollView>
                </View>
            </View>
        );
    }
};

export default App;