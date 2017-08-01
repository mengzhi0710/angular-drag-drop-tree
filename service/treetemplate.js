'use strict';
/*
 * 
 * treetemplate
 * 
 *
 */
angular.module('myapp')
.service('treetemplate', function() {
  //root node
  var template1 = function(key) {
    var box1 = '<div class="box">' +
                  '<li class="draglist">' +
                    '<h4 id=' + key.id + '>' + key.name + '</h4>' +
                    '<span class="fa fa-remove wm-remove"></span>' +
                  '</li>' +
                  '<div class="wrapper"></div>' +
               '</div>';
    return box1;
  }

  //leaf node
  var template2 = function(key) {
    var box2 = '<div class="box">' +
                  '<div class="iconlist">' +
                    '<span class="error wm-connect">+</span>' +
                  '</div>' + 
                  '<li class="draglist">' +
                    '<h4 id=' + key.id + '>' + key.name + '</h4>' +
                    '<span class="fa fa-remove wm-remove"></span>' +
                  '</li>' +
                  '<div class="wrapper"></div>' +
                '</div>';
    return box2;
  }

  return {
    template1: template1,
    template2: template2
  }
})
.factory('dndApi', function() {
    var dnd = {
      dragObject: {}
    };
    var areas = [];
    var event = {};
    return {
      addArea: function(area) {
        areas.push(area);
      },
      areas: function() {
        return areas;
      },
      setData: function(data, element) {
        dnd.drag = {
          data: data,
          element: element
        };
      },
      clear: function() {
        delete dnd.drag;
      },
      getData: function() {
        return dnd.drag;
      },
      getFireFoxEvent: function() {
        return event;
      },
      setFireFoxEvent: function(e) {
        event = e;
      }
    };
  })
 /**
  * 
 * 拖拽用的事件 com from https://github.com/fisshy/angular-drag-drop
 * 
 */
.directive('drag', ['dndApi',function(dndApi) {
    var drags = [];
    var dragables = [];
    var attrs = ['start', 'end', 'ngModel'];
    return {
      restrict: 'A',
      link: function($scope, $elem, $attr) {
        dragables.push($elem);
        var me = {};
        //为了执行元素上面绑定的方法
        angular.forEach(attrs, function(attr, key) {
          if ($attr[attr]) {
            me[attr] = $scope.$eval($attr[attr]);
          }
        });
        //ngModel的判空,me里面放的是ngModel的值
        if (angular.isUndefined(me.ngModel)) {
          return;
        }
        // angular.element(elem).attr('draggable', true);
        var elem = $elem[0];
        //拖拽开始
        elem.addEventListener('dragstart', function(event) {

          if (drags.length === 0) {
            drags = document.querySelectorAll('.drop');
          }

          angular.forEach(dndApi.areas(), function(value, key) {
            value.addClass('dropable');
          });
          //设置
          dndApi.setData(me.ngModel, $elem);

          (event.originalEvent || event).dataTransfer.effectAllowed = 'move';
          //解决火狐下面的bug
          (event.originalEvent || event).dataTransfer.setData('asdf', '');

          if (angular.isFunction(me.start)) {
            $scope.$apply(function() {
              me.start(dndApi.getData(), $elem);
            });
          }

        });
        //拖拽结束
        elem.addEventListener('dragend', function(event) {
          $elem.removeClass('dragging');
          angular.forEach(dndApi.areas(), function(area) {
            area.removeClass('dropable');
          });
          angular.forEach(dragables, function($el) {
            $el.removeClass('hover');
          });
          if (angular.isFunction(me.end)) {
            $scope.$apply(function() {
              me.end(dndApi.getData(), $elem);
            });
          }
         
          event.dataTransfer.clearData();
          dndApi.clear();
          return;
        });

        var hasHover = false;
        //鼠标在拖拽内容上方
        elem.addEventListener('dragover', function(event) {
          if (event.preventDefault) {
            event.preventDefault();
          }
          if (!hasHover) {
            $elem.addClass('hover');
            hasHover = true;
          }
         // return false;
        });
        //鼠标离开拖拽内容
        elem.addEventListener('dragleave', function(event) {
          if (event.preventDefault) {
            event.preventDefault();
          }
          if (hasHover) {
            $elem.removeClass('hover');
            hasHover = false;
          }
          //return false;
        });
        // 把元素的可拖拽属性设置为true
        elem.draggable = true;
      }
    };
  }])
.directive('drop', ['dndApi','treetemplate','$compile',function(dndApi,treetemplate,$compile) {
    var areas = [];
    var drags = [];
    var attrs = ['drop', 'enter', 'leave'];
    return {
      //$elem 指令所在的元素
      link: function($scope, $elem, $attr) {
        var me = {};
        var elem = $elem[0];
        var left = elem.offsetLeft,
          right = left + elem.offsetWidth,
          top = elem.offsetTop,
          bottom = top + elem.offsetHeight;

        var ngModel = $scope.$eval($attr.ngModel);
        //为了执行元素上面绑定的方法
        angular.forEach(attrs, function(attr, key) {
          if ($attr[attr]) {
            me[attr] = $scope.$eval($attr[attr]);
          }
        });

        dndApi.addArea($elem);
        //在一个拖动过程中，释放鼠标键时触发此事件
        elem.addEventListener('drop', function(event) {
          if (event.preventDefault) {
            event.preventDefault();
          }
          dndApi.setFireFoxEvent(event);
          //拖拽的内容
          var result = dndApi.getData();
          if (!$elem.hasClass('dropable')) {
            return;
          }
          //如果drop后面是一个方法的话，执行该方法
          if (angular.isFunction(me.drop)) {
            $scope.$apply(function() {
              if (ngModel) {
                me.drop(result.data, ngModel, result.element);
              } else {
                me.drop(result.data, result.element);
              }
            });
          }
          var moveToMain = function(key, element) {
              var target = "";
             // console.info("key-----",key);
              if (typeof(event) == 'undefined') {
                //fix firefox's bug
                target = dndApi.getFireFoxEvent().target;
              } else {
                target = (window.event) ? window.event.srcElement : event.target;
              }
              if(target.id === ""){
                return;
              }
              //self join valid
              var idx = key.id;
              if (target.id == "dust-main") {
                var eleMain = angular.element(".dust-content");
                eleMain.append(treetemplate.template1(key));
              } else {
                var destNode = angular.element(target.parentNode.parentNode.lastChild);
                destNode.append(treetemplate.template2(key));
              }
              $compile(angular.element(".box"))($scope);
            }

            moveToMain(result.data, result.element);

          angular.forEach(dndApi.areas(), function(area, key) {
            area.addClass('dropable');
            area.removeClass('hover');
          });

          $elem.removeClass("hover");
          dndApi.clear();
        });

        var hasHover = false;
        //拖曳元素进入目标元素
        elem.addEventListener('dragenter', function(event) {
          if (!hasHover) {
            $elem.addClass('hover');
            hasHover = true;
          }
          if (elem === event.target && angular.isFunction(me.enter)) {
            $scope.$apply(function() {
              var result = dndApi.getData();
              me.enter(result.data, result.element);
            });
          }
        });
        //在可拖动的元素移出放置目标时
        elem.addEventListener('dragleave', function(event) {
          if (hasHover) {
            $elem.removeClass('hover');
            hasHover = false;
          }
          if ((event.x < left || event.x > right) || (event.y < top || event.y > bottom)) {
            if (angular.isFunction(me.leave)) {
              $scope.$apply(function() {
                var result = dndApi.getData();
                me.leave(result.data, result.element);
              });
            }
          }
        });
        //拖拽元素在目标元素上移动
        elem.addEventListener('dragover', function(event) {
          if (!hasHover) {
            $elem.addClass('hover');
            hasHover = true;
          }
          if (event.preventDefault) {
            event.preventDefault();
          }
          return false;
        });

        $elem.addClass('drop');
      }
    };
  }])
