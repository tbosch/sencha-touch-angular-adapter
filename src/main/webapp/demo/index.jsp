<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" xmlns:stng="http://sencha-touch-angular.org">
<head>
    <title>Sencha Toys</title>
    <script>parent.instrument && parent.instrument(window);</script>
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

<st:tabpanel tab-bar-dock="bottom" id="main" fullscreen="true">
    <jsp:include page="lists.jsp"></jsp:include>
    <jsp:include page="toolbars.jsp"></jsp:include>
    <jsp:include page="popups.jsp"></jsp:include>
    <jsp:include page="carousel.jsp"></jsp:include>
    <jsp:include page="form.jsp"></jsp:include>
</st:tabpanel>

<st:sheet id="sheet1" ng:controller="PopupController">
    <st:button dock="top" text="Button1" st:event="tap:hide('sheet1')"></st:button>
</st:sheet>

<st:panel title="Popup1" id="popup1" floating="true" centered="true" modal="true" ng:controller="PopupController">
    <st:custom>
        Hello
    </st:custom>
    <st:button text="Hide" st:event="tap:hide('popup1')"></st:button>
</st:panel>


</body>
</html>