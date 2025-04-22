#import "StarDeviceDiscoveryManagerWrapper.h"

#import "StarObjectManager.h"
#import "StarIO10ValueConverter.h"
#import "EventParameter.h"
#import <React/RCTLog.h>

@import StarIO10;

@interface StarDeviceDiscoveryManagerWrapper()

@property(assign, nonatomic) StarObjectManager *objManager;

@end


@implementation StarDeviceDiscoveryManagerWrapper
{
    bool hasListeners;
}

- (instancetype)init
{
    self = [super init];
    if (self) {
        _objManager = StarObjectManager.sharedManager;
    }
    return self;
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

RCT_EXPORT_MODULE();


#pragma mark - Method

RCT_REMAP_METHOD(init,
                 createWithInterfaceTypes:(nonnull NSArray<NSString *> *)types
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableArray<NSNumber *> *numberArray = [[NSMutableArray alloc] init];
    
    for (NSString *type in types) {
        STARIO10InterfaceType nativeType = [StarIO10ValueConverter toInterfaceType:type];
        [numberArray addObject:@(nativeType)];
    }

    NSError *error = nil;
    id<STARIO10StarDeviceDiscoveryManager> manager = [STARIO10StarDeviceDiscoveryManagerFactory createWithInterfaceTypes:numberArray error:&error];
    
    if (error) {
        NSString *errorID = [_objManager add:error];
        reject(errorID, error.localizedDescription, nil);
        return;
    }
    
    manager.delegate = self;
    NSString *objID = [_objManager add:manager];
    resolve(objID);
}

RCT_REMAP_METHOD(dispose,
                 disposeWithObjectIdentifier:(nonnull NSString *)objID
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    [_objManager remove:objID];

    resolve(nil);
}

#pragma mark -

RCT_REMAP_METHOD(startDiscovery,
                 startDiscoveryWithObjectIdentifier:(nonnull NSString *)objID
                 discoveryTime:(nonnull NSNumber *)discoveryTime
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    id<STARIO10StarDeviceDiscoveryManager> manager = [_objManager getObject:objID];
    
    if (manager == nil) {
        reject(@"Error", @"Fail to get object.", nil);
        return;
    }
    
    manager.discoveryTime = discoveryTime.integerValue;
    
    NSError *error = nil;
    [manager startDiscoveryWithError:&error];
    
    if (error) {
        NSString *errorID = [_objManager add:error];
        reject(errorID, error.localizedDescription, nil);
        return;
    }
    
    resolve(nil);
}

RCT_REMAP_METHOD(stopDiscovery,
                 stopDiscoveryWithObjectIdentifier:(nonnull NSString *)objID
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    id<STARIO10StarDeviceDiscoveryManager> manager = [_objManager getObject:objID];
    
    if (manager == nil) {
        reject(@"Error", @"Fail to get object.", nil);
        return;
    }
    
    [manager stopDiscovery];
    
    resolve(nil);
}



// Will be called when this module's first listener is added.
-(void)startObserving {
    hasListeners = YES;
    NSLog(@"StarDeviceDiscoveryManagerWrapper startObserving");
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
    hasListeners = NO;
    NSLog(@"StarDeviceDiscoveryManagerWrapper stopObserving");
   // Remove upstream listeners, stop unnecessary background tasks
}


#pragma mark - Event




- (NSArray<NSString *> *)supportedEvents {
    return @[kNamePrinterFound,
             kNameDiscoveryFinished];
}

- (void)manager:(id<STARIO10StarDeviceDiscoveryManager>)manager didFindPrinter:(STARIO10StarPrinter *)printer {
    NSString* objID = [_objManager getExsitingIdentifier:manager];
    
    if (objID) {
        NSLog(@"StarDeviceDiscoveryManagerWrapper found object, has listener %s", hasListeners? "true" : "false");
        NSLog(@"StarDeviceDiscoveryManagerWrapper objID %@", objID);


        NSString *interfaceTypeString = [StarIO10ValueConverter toStringFromInterfaceType:printer.connectionSettings.interfaceType];
        NSString *modelString = [StarIO10ValueConverter toStringFromStarPrinterModel:printer.information.model];
        NSString *emulationString = [StarIO10ValueConverter toStringFromStarPrinterEmulation:printer.information.emulation];

        
        NSLog(@"StarDeviceDiscoveryManagerWrapper interfaceTypeString %@", interfaceTypeString);
        NSLog(@"StarDeviceDiscoveryManagerWrapper modelString %@", modelString);
        NSLog(@"StarDeviceDiscoveryManagerWrapper emulationString %@", emulationString);
        NSLog(@"StarDeviceDiscoveryManagerWrapper printer description %@", printer.description);
        NSLog(@"StarDeviceDiscoveryManagerWrapper connection identifier %@", printer.connectionSettings.identifier);
        
        
        NSLog(@"StarDeviceDiscoveryManagerWrapper kNamePrinterFound %@", kNamePrinterFound);
        NSLog(@"StarDeviceDiscoveryManagerWrapper kNameDiscoveryFinished %@", kNameDiscoveryFinished);

        
        NSLog(@"Sending event: %@", kNamePrinterFound);
        dispatch_async(dispatch_get_main_queue(), ^{

            [self sendEventWithName:kNamePrinterFound body:@{kKeyIdentifier: objID,
                                                             kKeyInterfaceType: interfaceTypeString,
                                                             kKeyConnectionIdentifier: printer.connectionSettings.identifier,
                                                             kKeyModel: modelString,
                                                             kKeyEmulation: emulationString,
                                                             kKeyReserved: [StarIO10ValueConverter toJSNamingDictionary:printer.information.reserved]
            }];
            
            NSLog(@"StarDeviceDiscoveryManagerWrapper Sending event: %@ with body: %@", kNamePrinterFound, @{
                kKeyIdentifier: objID,
                kKeyInterfaceType: interfaceTypeString,
                kKeyConnectionIdentifier: printer.connectionSettings.identifier,
                kKeyModel: modelString,
                kKeyEmulation: emulationString,
                kKeyReserved: [StarIO10ValueConverter toJSNamingDictionary:printer.information.reserved]
            });
        });
    } else {
        NSLog(@"StarDeviceDiscoveryManagerWrapper Fail to get object, has listener %s", hasListeners? "true" : "false");

    }
}

- (void)managerDidFinishDiscovery:(id<STARIO10StarDeviceDiscoveryManager> _Nonnull)manager {
    NSString* objID = [_objManager getExsitingIdentifier:manager];
    
    if (objID) {
        NSLog(@"StarDeviceDiscoveryManagerWrapper managerDidFinishDiscovery, has listener %s", hasListeners? "true" : "false");
     [self sendEventWithName:kNameDiscoveryFinished body:@{kKeyIdentifier: objID}];
    } else {
        NSLog(@"StarDeviceDiscoveryManagerWrapper managerDidFinishDiscovery else, has listener %s", hasListeners? "true" : "false");

    }
}

@end
