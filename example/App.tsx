import React from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  PermissionsAndroid,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import {Picker} from '@react-native-picker/picker';

import {
  InterfaceType,
  StarConnectionSettings,
  StarXpandCommand,
  StarPrinter,
  StarDeviceDiscoveryManagerFactory,
} from 'react-native-star-io10';

interface AppState {
  interfaceType: InterfaceType;
  identifier: string;
}
interface PrinterIdentifier {
  interfaceType: InterfaceType;
  identifier: string;
}

const App = () => {
  const [state, setState] = React.useState<AppState>({
    interfaceType: InterfaceType.Lan,
    identifier: '00:11:62:00:00:00',
  });

  const [identifierList, setIdentifierList] = React.useState<
    PrinterIdentifier[]
  >([]);
  const [isScanning, setIsScanning] = React.useState(false);

  const confirmBluetoothPermission = async (): Promise<boolean> => {
    var hasPermission = false;

    try {
      hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      );

      if (!hasPermission) {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );

        hasPermission = status == PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
    }

    return hasPermission;
  };

  const onPressPrintButton = async () => {
    var settings = new StarConnectionSettings();
    settings.interfaceType = state.interfaceType;
    settings.identifier = state.identifier;
    // settings.autoSwitchInterface = true;

    // If you are using Android 12 and targetSdkVersion is 31 or later,
    // you have to request Bluetooth permission (Nearby devices permission) to use the Bluetooth printer.
    // https://developer.android.com/about/versions/12/features/bluetooth-permissions
    if (Platform.OS == 'android' && 31 <= Platform.Version) {
      if (
        state.interfaceType == InterfaceType.Bluetooth ||
        settings.autoSwitchInterface == true
      ) {
        var hasPermission = await confirmBluetoothPermission();

        if (!hasPermission) {
          console.log(
            `PERMISSION ERROR: You have to allow Nearby devices to use the Bluetooth printer`,
          );
          return;
        }
      }
    }

    var printer = new StarPrinter(settings);

    try {
      // TSP100III series and TSP100IIU+ do not support actionPrintText because these products are graphics-only printers.
      // Please use the actionPrintImage method to create printing data for these products.
      // For other available methods, please also refer to "Supported Model" of each method.
      // https://www.star-m.jp/products/s_print/sdk/react-native-star-io10/manual/en/api-reference/star-xpand-command/printer-builder/action-print-image.html
      var builder = new StarXpandCommand.StarXpandCommandBuilder();
      builder.addDocument(
        new StarXpandCommand.DocumentBuilder()
          // To open a cash drawer, comment out the following code.
          //          .addDrawer(new StarXpandCommand.DrawerBuilder()
          //              .actionOpen(new StarXpandCommand.Drawer.OpenParameter())
          //          )
          .addPrinter(
            new StarXpandCommand.PrinterBuilder()
              .actionPrintImage(
                new StarXpandCommand.Printer.ImageParameter('logo_01.png', 406),
              )
              .styleInternationalCharacter(
                StarXpandCommand.Printer.InternationalCharacterType.Usa,
              )
              .styleCharacterSpace(0)
              .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
              .actionPrintText(
                'Star Clothing Boutique\n' +
                  '123 Star Road\n' +
                  'City, State 12345\n' +
                  '\n',
              )
              .styleAlignment(StarXpandCommand.Printer.Alignment.Left)
              .actionPrintText(
                'Date:MM/DD/YYYY    Time:HH:MM PM\n' +
                  '--------------------------------\n' +
                  '\n',
              )
              .actionPrintText(
                'SKU         Description    Total\n' +
                  '300678566   PLAIN T-SHIRT  10.99\n' +
                  '300692003   BLACK DENIM    29.99\n' +
                  '300651148   BLUE DENIM     29.99\n' +
                  '300642980   STRIPED DRESS  49.99\n' +
                  '300638471   BLACK BOOTS    35.99\n' +
                  '\n' +
                  'Subtotal                  156.95\n' +
                  'Tax                         0.00\n' +
                  '--------------------------------\n',
              )
              .actionPrintText('Total     ')
              .add(
                new StarXpandCommand.PrinterBuilder()
                  .styleMagnification(
                    new StarXpandCommand.MagnificationParameter(2, 2),
                  )
                  .actionPrintText('   $156.95\n'),
              )
              .actionPrintText(
                '--------------------------------\n' +
                  '\n' +
                  'Charge\n' +
                  '156.95\n' +
                  'Visa XXXX-XXXX-XXXX-0123\n' +
                  '\n',
              )
              .add(
                new StarXpandCommand.PrinterBuilder()
                  .styleInvert(true)
                  .actionPrintText('Refunds and Exchanges\n'),
              )
              .actionPrintText('Within ')
              .add(
                new StarXpandCommand.PrinterBuilder()
                  .styleUnderLine(true)
                  .actionPrintText('30 days'),
              )
              .actionPrintText(' with receipt\n')
              .actionPrintText('And tags attached\n' + '\n')
              .styleAlignment(StarXpandCommand.Printer.Alignment.Center)
              .actionPrintBarcode(
                new StarXpandCommand.Printer.BarcodeParameter(
                  '0123456',
                  StarXpandCommand.Printer.BarcodeSymbology.Jan8,
                )
                  .setBarDots(3)
                  .setBarRatioLevel(
                    StarXpandCommand.Printer.BarcodeBarRatioLevel.Level0,
                  )
                  .setHeight(5)
                  .setPrintHri(true),
              )
              .actionFeedLine(1)
              .actionPrintQRCode(
                new StarXpandCommand.Printer.QRCodeParameter('Hello World.\n')
                  .setModel(StarXpandCommand.Printer.QRCodeModel.Model2)
                  .setLevel(StarXpandCommand.Printer.QRCodeLevel.L)
                  .setCellSize(8),
              )
              .actionCut(StarXpandCommand.Printer.CutType.Partial),
          ),
      );

      var commands = await builder.getCommands();

      await printer.open();
      await printer.print(commands);

      console.log(`Success`);
    } catch (error) {
      console.log(`Error: ${String(error)}`);
    } finally {
      await printer.close();
      await printer.dispose();
    }
  };

  const onPressScan = async () => {
    // Scan for Bluetooth devices
    const printerlist: StarPrinter[] = [];
    console.log(`onPressScan`);

    const manager = await StarDeviceDiscoveryManagerFactory.create([
      state.interfaceType,
    ]);

    // manager.discoveryTime = 5000;

    // manager.onDiscoveryFinished = async () => {
    //   console.log(`stopDiscovery`);
    //   setIsScanning(false);
    // };

    manager.onPrinterFound = async p => {
      console.log(`onPrinterFound`, p);
      await p.open();
      const {interfaceType, identifier} = p.connectionSettings;
      const printerParsed = {interfaceType, identifier};
      await p.close();

      setIdentifierList(l => [...l, printerParsed]);
      printerlist.push(p);
    };

    manager.startDiscovery().catch(error => {
      setIsScanning(false);
      console.log(`Error: ${String(error)}`);
    });
    setTimeout(() => {
      console.log(`stopDiscovery`);
      setIsScanning(false);
      manager.stopDiscovery();
    }, 5000);
    setIsScanning(true);
  };

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <View style={{marginTop: 20}}>
        <Text>Interface</Text>
        <Picker
          selectedValue={state.interfaceType}
          onValueChange={interfaceType =>
            setState(s => ({...s, interfaceType}))
          }>
          <Picker.Item color="black" label="LAN" value={InterfaceType.Lan} />
          <Picker.Item
            color="black"
            label="Bluetooth"
            value={InterfaceType.Bluetooth}
          />
          <Picker.Item
            color="black"
            label="Bluetooth LE"
            value={InterfaceType.BluetoothLE}
          />
          <Picker.Item color="black" label="USB" value={InterfaceType.Usb} />
        </Picker>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <Button title="scan" onPress={onPressScan} />
        <ActivityIndicator
          animating={isScanning}
          size="small"
          color="#0000ff"
        />
      </View>
      <Text>Identifier ({identifierList.length})</Text>
      <Picker
        style={{}}
        selectedValue={state.interfaceType}
        onValueChange={interfaceType => setState(s => ({...s, interfaceType}))}>
        {identifierList.map((item, index) => (
          <Picker.Item
            key={`${item.identifier}-${item.interfaceType}-${index}`}
            color="black"
            label={`${item.identifier}-${item.interfaceType}`}
            value={item.identifier}
          />
        ))}
      </Picker>
      {/* <TextInput
          style={{width: 200, marginLeft: 20}}
          value={state.identifier}
          onChangeText={identifier => {
            setState(s => ({...s, identifier}));
          }}
        /> */}

      <Button title="Print" onPress={onPressPrintButton} />
    </ScrollView>
  );
};

export default App;
