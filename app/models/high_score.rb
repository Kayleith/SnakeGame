class HighScore < ActiveRecord::Base
  validates :name, :score, presence: true
end
