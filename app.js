'use strict';
//往angular中注入模块
angular.module('myapp', []);

angular.module('myapp').controller('democtrl',['$scope','dndApi','treetemplate','$compile',function($scope,dndApi,treetemplate,$compile){
	console.info("hello");
	$scope.keys = [{
                'name': 'name1',
                'id':1
              },{
                'name': 'name2',
                'id':2
              },{
                'name': 'name3',
                'id':3
              },{
                'name': 'name4',
                'id':4
              }];
}])

