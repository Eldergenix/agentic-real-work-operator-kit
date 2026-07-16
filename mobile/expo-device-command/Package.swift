// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "OperatorDeviceCommand",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "OperatorDeviceCommand", targets: ["OperatorDeviceCommand"])
    ],
    targets: [
        .target(name: "OperatorDeviceCommand"),
        .testTarget(name: "OperatorDeviceCommandTests", dependencies: ["OperatorDeviceCommand"])
    ]
)
