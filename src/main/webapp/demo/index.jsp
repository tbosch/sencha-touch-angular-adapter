<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" xmlns:stng="http://sencha-touch-angular.org">
<head>
    <title>Sencha Toys</title>
    <script>parent.instrument && parent.instrument(window);</script>
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
    <meta name="tablet-startup-screen" content="tablet_startup.png">
    <meta name="phone-startup-screen" content="phone_startup.png">
    <meta name="icon" content="icon.png">
    <meta name="gloss-on-icon" content="false">

    <link rel="stylesheet" href="../lib/sencha-touch.css"/>

    <script src="../lib/angular-0.9.19.js"></script>
    <script src="../lib/sencha-touch-1.1.0.js"></script>
    <script src="../lib/require.js" data-main="../st-angular"></script>

</head>
<body>

<div st:xtype="tabpanel" tab-bar-dock="bottom" id="main" fullscreen="true">
    <jsp:include page="lists.jsp"></jsp:include>
    <jsp:include page="toolbars.jsp"></jsp:include>
    <jsp:include page="popups.jsp"></jsp:include>
    <jsp:include page="carousel.jsp"></jsp:include>
</div>

<div st:xtype="sheet" id="sheet1" ng:controller="PopupController">
    <div st:xtype="button" dock="top" text="Button1" st:event="tap:hide('sheet1')"></div>
</div>

<div st:xtype="panel" title="Popup1" id="popup1" floating="true" centered="true" modal="true" ng:controller="PopupController">
    <div st:xtype="custom">
        Hello
    </div>
    <div st:xtype="button" text="Hide" st:event="tap:hide('popup1')"></div>
</div>


</body>
</html>