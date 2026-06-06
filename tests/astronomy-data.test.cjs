require('./register-ts.cjs');

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { achievements } = require('../src/data/achievements.ts');
const { celestialBodies, bodyById, moons, planets, selectableBodies } = require('../src/data/celestialBodies.ts');
const { quizQuestions } = require('../src/data/quizQuestions.ts');
const { TIME_SPEEDS } = require('../src/constants/astronomy.ts');

describe('astronomy data', () => {
  it('contains the Sun, eight planets and required moons', () => {
    assert.equal(bodyById.sun.name, 'Słońce');
    assert.equal(planets.length, 8);
    assert.equal(moons.length, 7);

    const expectedIds = [
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'moon',
      'io',
      'europa',
      'ganymede',
      'callisto',
      'titan',
      'triton',
    ];

    for (const id of expectedIds) {
      assert.ok(bodyById[id], `missing body: ${id}`);
    }
  });

  it('has complete educational and astronomical fields for every body', () => {
    const ids = new Set();

    for (const body of celestialBodies) {
      assert.ok(!ids.has(body.id), `duplicate id: ${body.id}`);
      ids.add(body.id);

      assert.ok(body.name.length > 1, `${body.id} name is missing`);
      assert.ok(body.diameterKm > 0, `${body.id} diameter must be positive`);
      assert.ok(body.massKg > 0, `${body.id} mass must be positive`);
      assert.ok(Number.isFinite(body.averageTemperatureC), `${body.id} temperature must be finite`);
      assert.ok(body.gravityMs2 >= 0, `${body.id} gravity must be non-negative`);
      assert.ok(Number.isFinite(body.orbitalVelocityKms), `${body.id} velocity must be finite`);
      assert.ok(body.atmosphere.length > 0, `${body.id} atmosphere is missing`);
      assert.ok(body.shortDescription.length >= 60, `${body.id} description is too short`);
      assert.ok(body.funFact.length >= 45, `${body.id} fun fact is too short`);
      assert.ok(body.sources.length >= 3, `${body.id} should cite multiple sources`);
      assert.ok(body.texture.base.length >= 2, `${body.id} texture base palette is incomplete`);
      assert.ok(/^#[0-9a-f]{6}$/i.test(body.themeColor), `${body.id} theme color should be hex`);

      if (body.type === 'moon') {
        assert.ok(body.parentId, `${body.id} moon must have parentId`);
        assert.ok(bodyById[body.parentId], `${body.id} parent does not exist`);
      }
    }
  });

  it('defines the required simulation time speeds', () => {
    assert.deepEqual([...TIME_SPEEDS], [0, 1, 10, 100, 1000, 10000]);
  });

  it('contains enough quiz questions with valid answers', () => {
    assert.ok(quizQuestions.length >= 10);

    for (const question of quizQuestions) {
      assert.ok(question.question.endsWith('?'), `${question.id} should be phrased as a question`);
      assert.equal(question.options.length, 4, `${question.id} should have four answers`);
      assert.ok(question.options.includes(question.correctAnswer), `${question.id} correct answer is not in options`);
      assert.ok(question.explanation.length >= 35, `${question.id} explanation is too short`);
      if (question.relatedBodyId) {
        assert.ok(bodyById[question.relatedBodyId], `${question.id} related body does not exist`);
      }
    }
  });

  it('tracks the requested achievement categories', () => {
    assert.equal(achievements.length, 4);
    assert.ok(achievements.some((achievement) => achievement.id === 'visit-all-planets' && achievement.target === 8));
    assert.ok(achievements.some((achievement) => achievement.id === 'visit-all-moons' && achievement.target === 7));
    assert.ok(achievements.some((achievement) => achievement.id === 'ten-quiz-answers' && achievement.target === 10));
    assert.ok(
      achievements.some(
        (achievement) => achievement.id === 'all-fun-facts' && achievement.target === celestialBodies.length,
      ),
    );
  });

  it('exposes all non-star bodies as selectable objects', () => {
    assert.equal(selectableBodies.length, planets.length + moons.length);
    assert.ok(selectableBodies.every((body) => body.type !== 'star'));
  });
});
