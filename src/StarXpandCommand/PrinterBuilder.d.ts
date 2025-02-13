import { BaseStarXpandCommandBuilder } from './BaseStarXpandCommandBuilder';
import { StarXpandCommand } from '../../index';
export declare class PrinterBuilder extends BaseStarXpandCommandBuilder {
    _parameters: Map<string, any>;
    constructor();
    styleAlignment(alignment: StarXpandCommand.Printer.Alignment): PrinterBuilder;
    styleFont(type: StarXpandCommand.Printer.FontType): PrinterBuilder;
    styleBold(enable: boolean): PrinterBuilder;
    styleInvert(enable: boolean): PrinterBuilder;
    styleUnderLine(enable: boolean): PrinterBuilder;
    styleMagnification(parameter: StarXpandCommand.MagnificationParameter): PrinterBuilder;
    styleCharacterSpace(width: number): PrinterBuilder;
    styleLineSpace(height: number): PrinterBuilder;
    styleHorizontalPositionTo(position: number): PrinterBuilder;
    styleHorizontalPositionBy(position: number): PrinterBuilder;
    styleHorizontalTabPositions(positions: Array<number>): PrinterBuilder;
    styleInternationalCharacter(type: StarXpandCommand.Printer.InternationalCharacterType): PrinterBuilder;
    styleSecondPriorityCharacterEncoding(type: StarXpandCommand.Printer.CharacterEncodingType): PrinterBuilder;
    styleCjkCharacterPriority(types: Array<StarXpandCommand.Printer.CjkCharacterType>): PrinterBuilder;
    actionCut(type: StarXpandCommand.Printer.CutType): PrinterBuilder;
    actionFeed(height: number): PrinterBuilder;
    actionFeedLine(lines: number): PrinterBuilder;
    actionPrintText(content: string): PrinterBuilder;
    actionPrintLogo(parameter: StarXpandCommand.Printer.LogoParameter): PrinterBuilder;
    actionPrintBarcode(parameter: StarXpandCommand.Printer.BarcodeParameter): PrinterBuilder;
    actionPrintPdf417(parameter: StarXpandCommand.Printer.Pdf417Parameter): PrinterBuilder;
    actionPrintQRCode(parameter: StarXpandCommand.Printer.QRCodeParameter): PrinterBuilder;
    actionPrintImage(parameter: StarXpandCommand.Printer.ImageParameter): PrinterBuilder;
    actionPrintRuledLine(parameter: StarXpandCommand.Printer.RuledLineParameter): PrinterBuilder;
    add(builder: PrinterBuilder): PrinterBuilder;
    addPageMode(parameters: StarXpandCommand.Printer.PageModeAreaParameter, builder: StarXpandCommand.PageModeBuilder): PrinterBuilder;
}
