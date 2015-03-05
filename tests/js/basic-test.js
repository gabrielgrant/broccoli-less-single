module('Basic');

test('this is a basic test', function() {
	var testDiv = $('.basic-test');
	expect(4);

	equal(testDiv.css('background-color'), 'rgb(0, 128, 0)');
	equal(testDiv.find('.foo').css('font-size'), '17px');
	equal(testDiv.find('.bar').css('font-size'), '20px');
	equal(testDiv.find('.bar').css('color'), 'rgb(255, 0, 0)');
});
